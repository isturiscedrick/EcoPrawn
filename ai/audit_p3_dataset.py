"""Read-only structural/integrity audit of the downloaded P3 release. Does not train a model."""
import argparse
from collections import Counter
import csv
import hashlib
import json
from pathlib import Path
import re
import numpy as np
from PIL import Image


def csv_rows(path):
    with path.open(encoding="utf-8-sig", newline="") as stream:
        return list(csv.DictReader(stream))


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def audit(root, standalone):
    root = root.resolve()
    if not (root / "labels.csv").is_file():
        root /= "P3_DATASET_RELEASE"
    rows = csv_rows(root / "labels.csv")
    organs = csv_rows(root / "organs_auditoria.csv")
    folds = csv_rows(root / "folds.csv")
    crosswalk = csv_rows(root / "crosswalk_p3.csv")
    offsets = csv_rows(root / "offsets.csv")
    hashes, missing, mismatched = {}, [], []
    for line in (root / "checksums.sha256").read_text(encoding="utf-8-sig").splitlines():
        expected, name = line.split(maxsplit=1)
        name = name.lstrip("*")
        path = (root / name).resolve()
        if not path.is_relative_to(root):
            raise ValueError("Checksum entry outside dataset")
        if not path.is_file():
            missing.append(name)
            continue
        actual = digest(path)
        hashes[name] = actual
        if actual != expected:
            mismatched.append(name)
    mismatch_crosswalk = []
    for row in crosswalk:
        name = row["release_archivo"]
        if hashes.get(name) != row["sha256"]:
            mismatch_crosswalk.append(dict(path=name, type=row["tipo"]))
    mask_errors, image_errors, geometries, image_hashes = [], [], [], []
    for row in rows:
        relative = f"{row['base']}/{row['archivo']}"
        path = root / relative
        with Image.open(path) as image:
            shape = image.size
            mode = image.mode
            if image.format != "PNG":
                image_errors.append(relative)
        image_hashes.append(hashes[relative])
        stem = re.sub(r"_frame\d+\.png$", "", row["archivo"])
        masks = {}
        for kind in ["full", "without_tail", "without_tail_and_eyes", "organs", "organs_corregida"]:
            name = f"{row['base']}/{stem}_mask_{kind}.png"
            mask_path = root / name
            if kind == "organs_corregida" and not mask_path.exists():
                continue
            if not mask_path.exists():
                mask_errors.append({"path": name, "error": "missing"})
                continue
            with Image.open(mask_path) as mask:
                values = np.array(mask)
                if mask.mode != "L" or mask.size != shape or not set(np.unique(values)).issubset({0, 255}) or not np.any(values):
                    mask_errors.append({"path": name, "error": "mode/dimensions/binary/empty"})
                masks[kind] = values > 0
        full = masks["full"]
        inner = masks["without_tail_and_eyes"]
        geometries.append(dict(id=row["id_trabajo_p3"], image=relative, width=shape[0], height=shape[1], mode=mode,
            fullAreaPx=int(full.sum()), innerInsideFullFraction=float((full & inner).sum()/inner.sum()),
            touchesImageBoundary=bool(full[0].any() or full[-1].any() or full[:, 0].any() or full[:, -1].any())))
    duplicate_images = len(image_hashes) - len(set(image_hashes))
    identities = [(r["base"], r["muestra_mendeley"]) for r in rows]
    ids = {r["id_trabajo_p3"] for r in rows}
    standalone_status = {}
    for path in standalone:
        target = root / path.name
        standalone_status[str(path)] = dict(matchesRelease=target.is_file() and digest(path) == digest(target), sha256=digest(path))
    numeric = {}
    for column in ["longitud_cm", "peso_g", "cefalotorax_cm", "px_por_cm_base"]:
        values = [float(r[column]) for r in rows if r[column] != ""]
        numeric[column] = dict(min=min(values), max=max(values), missing=len(rows)-len(values),
                               invalid=sum(not np.isfinite(v) or v <= 0 for v in values))
    fold_columns = [key for key in folds[0] if key.startswith("fold_")]
    fold_audit = {column: dict(counts=dict(Counter(r[column] for r in folds)),
        valid=all(r[column] in {str(n) for n in range(10)} for r in folds)) for column in fold_columns}
    return dict(root=str(root), checksumEntries=len(hashes)+len(missing), checksumsMatched=len(hashes)-len(mismatched),
        missingFiles=missing, checksumMismatches=mismatched,
        images=len(rows), specimensByGroup=dict(Counter(r["base"] for r in rows)),
        originalMasks=len(list(root.glob("DB*/*_mask_*.png")))-len(list(root.glob("DB*/*_mask_organs_corregida.png"))),
        correctedOrganMasks=len(list(root.glob("DB*/*_mask_organs_corregida.png"))),
        disputedLabels=[r["id_trabajo_p3"] for r in rows if r["etiqueta_en_disputa"].lower() == "true"],
        organStatus=dict(Counter(r["estado"] for r in organs)),
        organIdsMatch=ids == {r["id_trabajo_p3"] for r in organs},
        foldIdsMatch=ids == {r["id_trabajo_p3"] for r in folds}, foldAudit=fold_audit,
        duplicateSpecimenIds=len(identities)-len(set(identities)), duplicateImages=duplicate_images,
        standaloneFiles=standalone_status, numericLabels=numeric, maskErrors=mask_errors, imageErrors=image_errors,
        crosswalkEntries=len(crosswalk), crosswalkMismatches=mismatch_crosswalk,
        crosswalkMismatchTypes=dict(Counter(r["type"] for r in mismatch_crosswalk)),
        offsetsRows=len(offsets), geometries=geometries,
        fullMasksTouchingBoundary=sum(r["touchesImageBoundary"] for r in geometries),
        medianInnerInsideFull=float(np.median([r["innerInsideFullFraction"] for r in geometries])))


if __name__ == "__main__":
    p = argparse.ArgumentParser()
    p.add_argument("directory", type=Path)
    p.add_argument("--standalone", nargs="*", type=Path, default=[])
    p.add_argument("--output", type=Path, default=Path(__file__).parent / "reports/p3-dataset-audit.json")
    args = p.parse_args()
    result = audit(args.directory, args.standalone)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(result, indent=2), encoding="utf-8")
    print(json.dumps({k:v for k,v in result.items() if k not in ["geometries", "crosswalkMismatches", "foldAudit"]}, indent=2))
