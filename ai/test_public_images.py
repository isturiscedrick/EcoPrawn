"""Reproducible external-image smoke test; never invents camera calibration or trains models."""
import argparse
import base64
from collections import Counter
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone
import hashlib
from http.server import ThreadingHTTPServer
import json
from pathlib import Path
import re
import secrets
import threading
import time
from unittest.mock import patch
from urllib.parse import quote
import urllib.request

import cv2
import numpy as np
from pipeline import decode_image
from server import Handler

ROOT = Path(__file__).resolve().parent
DATA = ROOT / "data" / "external-shrimp"
REPORTS = ROOT / "reports"
REPOSITORY = "DeepanSadhukhan/vannamei-shrimp-biomass-dataset"
REVISION = "0000d38824377c03318e3cb0d775a808261f8f80"
ORIGINAL = "https://data.mendeley.com/datasets/h8tcn6ykky/2"
MIRROR = "https://huggingface.co/datasets/" + REPOSITORY


def read_url(url, limit=16 * 1024 * 1024):
    with urllib.request.urlopen(url, timeout=40) as response:
        data = response.read(limit + 1)
        if len(data) > limit:
            raise ValueError("Public download exceeds size budget")
        return data, response.headers


def directory_files(group):
    prefix = f"https://huggingface.co/api/datasets/{REPOSITORY}/tree/{REVISION}/{group}"
    url = prefix + "?limit=1000"
    rows = []
    for _ in range(5):
        data, headers = read_url(url)
        rows.extend(json.loads(data))
        next_page = re.search(r'<([^>]+)>;\s*rel="next"', headers.get("Link", ""))
        if not next_page:
            return rows
        url = next_page.group(1)
        if not url.startswith(prefix + "?"):
            raise ValueError("Unexpected pagination destination")
    raise ValueError("Unexpectedly large dataset directory")


def acquire_group(group):
    entries = directory_files(group)
    specimens = {}
    for entry in entries:
        match = re.fullmatch(rf"{group}/s(\d+)_(\d+)\.png", entry["path"], re.IGNORECASE)
        if not match:
            continue
        specimen, frame = map(int, match.groups())
        if specimen not in specimens or frame < specimens[specimen][0]:
            specimens[specimen] = (frame, entry)
    ordered = sorted(specimens)
    # Six distinct animals, evenly spaced by specimen ID. No selection by model outcome.
    selected = [ordered[round(i * (len(ordered)-1) / 5)] for i in range(6)]
    result = []
    for specimen in selected:
        _, entry = specimens[specimen]
        path = entry["path"]
        target = DATA / path
        target.parent.mkdir(parents=True, exist_ok=True)
        url = f"{MIRROR}/resolve/{REVISION}/{quote(path, safe='/')}"
        if not target.is_file():
            data, _ = read_url(url)
            target.write_bytes(data)
        data = target.read_bytes()
        digest = hashlib.sha256(data).hexdigest()
        expected = entry.get("lfs", {}).get("oid")
        if expected and digest != expected:
            raise ValueError(f"Checksum mismatch for {path}")
        result.append(dict(group=group, specimenId=str(specimen), path=path, url=url,
                           bytes=len(data), sha256=digest, expectedSha256=expected))
    return result


def download():
    DATA.mkdir(parents=True, exist_ok=True)
    groups = [f"DB{i}" for i in range(1, 6)]
    with ThreadPoolExecutor(max_workers=3) as pool:
        rows = [row for group in pool.map(acquire_group, groups) for row in group]
    manifest = dict(originalSource=ORIGINAL, mirror=MIRROR, revision=REVISION, license="CC BY 4.0",
        licenseUrl="https://creativecommons.org/licenses/by/4.0/",
        attribution="Ramirez-Coronel, Esquer-Miranda, Rodriguez-Elias, Garcia-Hinostro and Parra-Salazar (2024), Mendeley Data V2, DOI 10.17632/h8tcn6ykky.2. Mirror by DeepanSadhukhan.",
        selection="Six evenly spaced specimen IDs per group, earliest numbered frame per animal. Original image bytes, no edits.", images=rows)
    REPORTS.mkdir(exist_ok=True)
    (REPORTS / "public-image-manifest.json").write_text(json.dumps(manifest, indent=2), encoding="utf-8")
    print(f"Downloaded and verified {len(rows)} images ({sum(r['bytes'] for r in rows)} bytes)", flush=True)
    return manifest


def test_images(manifest):
    service = ThreadingHTTPServer(("127.0.0.1", 0), Handler)
    worker = threading.Thread(target=service.serve_forever, daemon=True)
    worker.start()
    key = secrets.token_urlsafe(32)
    results = []
    detector = cv2.aruco.ArucoDetector(cv2.aruco.getPredefinedDictionary(cv2.aruco.DICT_4X4_50))
    try:
        with patch.dict("os.environ", {"GROWTH_AI_KEY": key}):
            for row in manifest["images"]:
                raw = (DATA / row["path"]).read_bytes()
                if hashlib.sha256(raw).hexdigest() != row["sha256"]:
                    raise ValueError("Cached image changed")
                encoded = base64.b64encode(raw).decode()
                image = decode_image(encoded)
                gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
                _, ids, _ = detector.detectMarkers(gray)
                border = np.concatenate([gray[:10].ravel(), gray[-10:].ravel(), gray[:, :10].ravel(), gray[:, -10:].ravel()])
                # Same illumination precondition as the existing pipeline, measured without changing the image.
                dark_tray = bool(np.std(border) <= 25 and np.median(border) <= 100)
                payload = json.dumps({"image": encoded, "calibration": {}}).encode()
                started = time.perf_counter()
                request = urllib.request.Request(f"http://127.0.0.1:{service.server_port}/analyze", data=payload,
                    headers={"Content-Type": "application/json", "Authorization": "Bearer " + key})
                with urllib.request.urlopen(request, timeout=15) as response:
                    result = json.load(response)
                    status_code = response.status
                analysis = result["analysis"]
                results.append(dict(path=row["path"], group=row["group"], specimenId=row["specimenId"],
                    width=image.shape[1], height=image.shape[0], httpStatus=status_code,
                    status=analysis["status"], reason=analysis["reason"], lengthMm=analysis["lengthMm"], weightG=analysis["weightG"],
                    markerIds=[] if ids is None else ids.ravel().tolist(), darkTrayPrecondition=dark_tray,
                    borderMedian=float(np.median(border)), borderStd=float(np.std(border)),
                    requestMs=round((time.perf_counter()-started)*1000, 2)))
                print(f"{row['path']}: {analysis['status']} ({analysis['reason']})", flush=True)
    finally:
        service.shutdown(); service.server_close(); worker.join()
    summary = dict(images=len(results), decoded=len(results), http200=sum(r["httpStatus"] == 200 for r in results),
        accepted=sum(r["status"] == "review" for r in results), rejected=sum(r["status"] == "rejected" for r in results),
        lengthOutputs=sum(r["lengthMm"] is not None for r in results), weightOutputs=sum(r["weightG"] is not None for r in results),
        imagesWithRequiredMarker=sum(r["markerIds"] == [0] for r in results),
        imagesMeetingDarkTrayPrecondition=sum(r["darkTrayPrecondition"] for r in results),
        reasons=dict(Counter(r["reason"] for r in results)), requestP95Ms=float(np.percentile([r["requestMs"] for r in results],95)))
    report = dict(testedAtUtc=datetime.now(timezone.utc).isoformat(), source=ORIGINAL, revision=REVISION,
        kind="External input compatibility and safe rejection; not biological accuracy evaluation",
        calibration="Unavailable. Empty profile supplied honestly; no synthetic marker or invented scale.",
        summary=summary, results=results)
    (REPORTS / "public-image-results.json").write_text(json.dumps(report, indent=2), encoding="utf-8")
    lines = ["# Public shrimp image test", "", f"Source: [{ORIGINAL}]({ORIGINAL}). CC BY 4.0; attribution and exact file hashes are in public-image-manifest.json.", "",
        "Thirty original PNGs from thirty different specimens, six from each of DB1–DB5, were sent through the authenticated local HTTP inference service. No production model, database or calibration was changed.", "",
        "| Check | Result |", "| --- | --- |"]
    for name, value in summary.items():
        lines.append(f"| {name} | {value} |")
    lines += ["", "## What this establishes", "",
        "The service can decode the selected real research photographs and refuses to fabricate measurements without calibration. Marker detection and the dark-tray precondition were also checked independently on the unchanged images.", "",
        "This is not a successful shrimp measurement or detection benchmark. The normal pipeline stops before segmentation because no camera calibration is available. Rejection latency is not measurement latency. Length MAE, weight MAE and detection accuracy cannot be calculated from this run.", "",
        "The current algorithm expects a calibrated dark tray and a physical ArUco reference. These public images come from a different capture setup. Adding a drawn marker, guessing camera intrinsics, or deriving scale from the test length labels would invalidate a measurement test.", "",
        "## Next useful experiment", "",
        "Use the public dataset for a separately evaluated shrimp segmentation model, with specimens kept in separate dataset partitions. The 148-image anatomical-mask subset at https://data.mendeley.com/datasets/n244f3kyd3/1 is a promising source, but its download endpoint returned HTTP 403 in this environment; it was not downloaded or tested. Confirm its length convention before comparing it with EcoPrawn's rostrum-to-telson measurement.", "",
        "For validating the existing application, collect calibrated photographs from the intended camera. Public weight/length labels do not supply that camera's calibration or establish performance on it.", "",
        "## Reproduce", "", "From ai/: `.venv/Scripts/python test_public_images.py --download`. To rerun cached images, omit `--download`. Raw images are kept in ignored `ai/data/external-shrimp/`; the manifest and reports are versionable."]
    (REPORTS / "public-image-test.md").write_text("\n".join(lines)+"\n", encoding="utf-8")
    print(json.dumps(summary, indent=2))


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--download", action="store_true")
    args = parser.parse_args()
    manifest = download() if args.download else json.loads((REPORTS / "public-image-manifest.json").read_text(encoding="utf-8"))
    test_images(manifest)
