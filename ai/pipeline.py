"""Controlled-tray measurement. Every successful measurement still needs human review."""
import base64
import heapq
import io
import math
import os
import time
from pathlib import Path

import cv2
import joblib
import numpy as np
from PIL import Image

ALGORITHM = "tray-centerline-v1"
FEATURES = ["lengthMm", "areaMm2", "widthMm"]


def calibration_valid(c):
    try:
        matrix = np.asarray(c["cameraMatrix"], dtype=float)
        distortion = np.asarray(c["distortion"], dtype=float)
        return (isinstance(c["version"], str) and bool(c["version"]) and
                isinstance(c["setupId"], str) and bool(c["setupId"]) and
                100 <= c["width"] <= 4096 and 100 <= c["height"] <= 4096 and
                5 <= c["markerMm"] <= 200 and matrix.shape == (3, 3) and
                np.isfinite(matrix).all() and matrix[0, 0] > 0 and matrix[1, 1] > 0 and
                distortion.size in (4, 5, 8, 12, 14) and np.isfinite(distortion).all())
    except (KeyError, ValueError, TypeError):
        return False


def decode_image(encoded):
    raw = base64.b64decode(encoded, validate=True)
    if not 32 <= len(raw) <= 8 * 1024 * 1024:
        raise ValueError("Image exceeds 8 MB")
    with Image.open(io.BytesIO(raw)) as header:
        if header.format not in ("JPEG", "PNG") or not all(100 <= d <= 4096 for d in header.size):
            raise ValueError("Use JPEG/PNG between 100 and 4096 pixels per side")
    image = cv2.imdecode(np.frombuffer(raw, np.uint8), cv2.IMREAD_COLOR)
    if image is None:
        raise ValueError("Image cannot be decoded")
    return image


def centerline(mask):
    """Longest geodesic on a thinned body; ignore short appendage branches."""
    small_scale = min(1.0, 700 / max(mask.shape))
    small = cv2.resize(mask, None, fx=small_scale, fy=small_scale, interpolation=cv2.INTER_NEAREST)
    skeleton = cv2.ximgproc.thinning(small)
    coords = set(map(tuple, np.argwhere(skeleton > 0)))
    if len(coords) < 10:
        raise ValueError("Body too small to measure")
    neighbors = lambda p: [(p[0] + dy, p[1] + dx) for dy in (-1, 0, 1) for dx in (-1, 0, 1)
                           if (dx or dy) and (p[0] + dy, p[1] + dx) in coords]
    ends = [p for p in coords if len(neighbors(p)) == 1]
    if len(ends) < 2 or len(ends) > 12:
        raise ValueError("Ambiguous or overlapping body; recapture")

    def farthest(start):
        distances, previous, queue = {start: 0.0}, {}, [(0.0, start)]
        while queue:
            distance, p = heapq.heappop(queue)
            if distance != distances[p]:
                continue
            for n in neighbors(p):
                candidate = distance + math.hypot(n[0] - p[0], n[1] - p[1])
                if candidate < distances.get(n, math.inf):
                    distances[n], previous[n] = candidate, p
                    heapq.heappush(queue, (candidate, n))
        return max(distances, key=distances.get), previous

    start, _ = farthest(ends[0])
    end, previous = farthest(start)
    path = [end]
    while path[-1] != start:
        path.append(previous[path[-1]])
    if len(path) / len(coords) < .75:
        raise ValueError("Branched or overlapping body; recapture one clearly separated shrimp")
    # Simplify staircase pixels before measuring, without replacing curved length by a bounding box.
    xy = np.array([[x / small_scale, y / small_scale] for y, x in path], np.float32)
    simplified = cv2.approxPolyDP(xy.reshape(-1, 1, 2), 1.5 / small_scale, False).reshape(-1, 2)
    return simplified.tolist()


def estimate_weight(features, model_path=None):
    path = Path(model_path or os.environ.get("GROWTH_WEIGHT_MODEL", "artifacts/weight.joblib"))
    if not path.is_file():
        return None, None, "No validated local weight model installed."
    # Only locally trained, trusted artifacts may be loaded: joblib is executable serialization.
    artifact = joblib.load(path)
    if not artifact.get("enabled") or artifact.get("algorithm") != ALGORITHM:
        return None, None, "Weight model has not passed evaluation for this measurement pipeline."
    x = np.array([[features[k] for k in FEATURES]])
    ranges = np.asarray(artifact["featureRanges"])
    if np.any(x[0] < ranges[:, 0]) or np.any(x[0] > ranges[:, 1]):
        return None, artifact["version"], "Outside the validated measurement range."
    if artifact["kind"] == "power":
        value = float(np.exp(artifact["model"].predict(np.log(x[:, :1]))[0]))
    else:
        value = float(artifact["model"].predict(x)[0])
    if not math.isfinite(value) or value <= 0:
        return None, artifact["version"], "Invalid model output."
    return value, artifact["version"], None


def analyze(encoded, calibration):
    started = time.perf_counter()
    image = decode_image(encoded)
    height, width = image.shape[:2]
    result = dict(status="rejected", reason=None, width=width, height=height, lengthMm=None,
                  areaMm2=None, widthMm=None, weightG=None, modelVersion=None,
                  weightReason="No valid measurement.", latencyMs=0, path=[], outline=[],
                  mmPerPixel=None, algorithm=ALGORITHM)
    try:
        if not calibration_valid(calibration):
            raise ValueError("Missing or invalid calibration")
        if (width, height) != (calibration["width"], calibration["height"]):
            raise ValueError("Resolution changed; recalibrate the camera")
        image = cv2.undistort(image, np.array(calibration["cameraMatrix"], float),
                              np.array(calibration["distortion"], float))
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        detector = cv2.aruco.ArucoDetector(cv2.aruco.getPredefinedDictionary(cv2.aruco.DICT_4X4_50))
        corners, ids, _ = detector.detectMarkers(gray)
        if ids is None or len(ids) != 1 or int(ids[0, 0]) != 0:
            raise ValueError("Exactly one ArUco 4x4_50 marker ID 0 must be visible")
        source = corners[0].reshape(4, 2).astype(np.float32)
        sides = np.linalg.norm(source - np.roll(source, 1, axis=0), axis=1)
        if min(sides) < 30 or max(sides) / min(sides) > 1.25:
            raise ValueError("Reference too small or camera tilted; recapture overhead")
        side = float(np.mean(sides))
        center = source.mean(axis=0)
        target = np.array([[-1, -1], [1, -1], [1, 1], [-1, 1]], np.float32) * side / 2 + center
        transform = cv2.getPerspectiveTransform(source, target)
        image = cv2.warpPerspective(image, transform, (width, height), borderMode=cv2.BORDER_REPLICATE)
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        scale = calibration["markerMm"] / side
        # A uniform dark tray is part of the capture contract. A marker sits clear of the shrimp.
        border = np.concatenate([gray[:10].ravel(), gray[-10:].ravel(), gray[:, :10].ravel(), gray[:, -10:].ravel()])
        if np.std(border) > 25 or np.median(border) > 100:
            raise ValueError("Use a uniformly dark matte tray with clear borders")
        mask = np.uint8(gray > float(np.median(border)) + 40) * 255
        marker_mask = np.zeros_like(mask)
        cv2.fillConvexPoly(marker_mask, target.astype(np.int32), 255)
        # Include the printed white quiet zone (one sixth of the marker width per side).
        marker_margin = max(25, int(side * .7) | 1)
        marker_mask = cv2.dilate(marker_mask, np.ones((marker_margin, marker_margin), np.uint8))
        mask[marker_mask > 0] = 0
        radius = max(3, int(min(width, height) / 250) | 1)
        mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (radius, radius)))
        mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, np.ones((3, 3), np.uint8))
        contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        contours = [c for c in contours if cv2.contourArea(c) > max(100, width * height * 0.001)]
        if not contours:
            raise ValueError("No measurable shrimp found")
        if len(contours) != 1:
            raise ValueError("Multiple objects or reflections; use one shrimp per image")
        contour = contours[0]
        x, y, w, h = cv2.boundingRect(contour)
        if x < 5 or y < 5 or x + w >= width - 5 or y + h >= height - 5:
            raise ValueError("Body clipped by image edge")
        if cv2.Laplacian(gray[y:y+h, x:x+w], cv2.CV_64F).var() < 25:
            raise ValueError("Image is blurred; recapture")
        body = np.zeros_like(mask)
        cv2.drawContours(body, [contour], -1, 255, -1)
        path = centerline(body)
        length = sum(math.dist(a, b) for a, b in zip(path, path[1:])) * scale
        area = cv2.contourArea(contour) * scale ** 2
        if length <= 0 or not 1.8 <= length ** 2 / area <= 40:
            raise ValueError("Ambiguous body shape; check overlap and appendages")
        result.update(status="review", lengthMm=length, areaMm2=area, widthMm=area / length,
                      path=path, outline=cv2.approxPolyDP(contour, 2, True).reshape(-1, 2).tolist(), mmPerPixel=scale)
        try:
            weight, version, reason = estimate_weight(result)
        except Exception:
            weight, version, reason = None, None, "Weight model unavailable or incompatible."
        result.update(weightG=weight, modelVersion=version, weightReason=reason)
    except ValueError as error:
        result["reason"] = str(error)
    result["latencyMs"] = round((time.perf_counter() - started) * 1000, 2)
    ok, preview = cv2.imencode(".png", image)
    if not ok:
        raise ValueError("Preview encoding failed")
    return {"analysis": result, "preview": base64.b64encode(preview).decode()}
