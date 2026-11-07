"""Create a camera profile from checkerboard images; print the reference marker separately."""
import argparse
import glob
import json
from pathlib import Path
import cv2
import numpy as np


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--images", help="Quoted glob of at least 10 checkerboard images")
    p.add_argument("--columns", type=int, default=9, help="Internal checkerboard corners")
    p.add_argument("--rows", type=int, default=6)
    p.add_argument("--square-mm", type=float, default=20)
    p.add_argument("--marker-mm", type=float, default=20)
    p.add_argument("--setup-id", default="tray-1")
    p.add_argument("--version", default="calibration-1")
    p.add_argument("--output", default="artifacts/calibration.json")
    p.add_argument("--marker", help="Write marker PNG and exit; print with black square at marker-mm size")
    args = p.parse_args()
    if args.marker:
        marker = cv2.aruco.generateImageMarker(cv2.aruco.getPredefinedDictionary(cv2.aruco.DICT_4X4_50), 0, 600)
        marker = cv2.copyMakeBorder(marker, 100, 100, 100, 100, cv2.BORDER_CONSTANT, value=255)
        Path(args.marker).parent.mkdir(parents=True, exist_ok=True)
        cv2.imwrite(args.marker, marker)
        return
    if not args.images or args.square_mm <= 0:
        p.error("Provide checkerboard images and positive square size")
    obj = np.zeros((args.columns * args.rows, 3), np.float32)
    obj[:, :2] = np.mgrid[0:args.columns, 0:args.rows].T.reshape(-1, 2) * args.square_mm
    objects, pixels, size = [], [], None
    for file in sorted(glob.glob(args.images)):
        image = cv2.imread(file, cv2.IMREAD_GRAYSCALE)
        if image is None:
            continue
        current = image.shape[::-1]
        if size is not None and size != current:
            raise ValueError("All calibration images must have the same resolution")
        size = current
        found, corners = cv2.findChessboardCornersSB(image, (args.columns, args.rows))
        if found:
            objects.append(obj)
            pixels.append(corners)
    if len(objects) < 10:
        raise ValueError("At least 10 usable checkerboard views are required")
    rms, matrix, distortion, _, _ = cv2.calibrateCamera(objects, pixels, size, None, None)
    if rms > 1:
        raise ValueError(f"Reprojection RMS {rms:.2f}px exceeds 1px; recapture calibration views")
    result = dict(version=args.version, setupId=args.setup_id, width=size[0], height=size[1],
                  markerMm=args.marker_mm, cameraMatrix=matrix.tolist(), distortion=distortion.ravel().tolist(),
                  reprojectionRmsPx=rms)
    Path(args.output).parent.mkdir(parents=True, exist_ok=True)
    Path(args.output).write_text(json.dumps(result, indent=2))
    print(f"Saved {args.output}; RMS {rms:.3f}px")


if __name__ == "__main__":
    main()
