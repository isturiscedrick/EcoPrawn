"""Run the experimental pixel model on a photograph without asserting physical measurements."""
import argparse
import base64
import json
from pathlib import Path
import time
import cv2
import joblib
import numpy as np
from pipeline import decode_image
from segmentation import FEATURE_VERSION, SIZE, probability, mask_from_probability


def predict(image_path, model_path, output):
    # Load only a trusted locally produced artifact: joblib can execute serialized code.
    artifact = joblib.load(model_path)
    if artifact.get("kind") != "experimental-p3-segmentation-v1" or artifact.get("featureVersion") != FEATURE_VERSION or tuple(artifact.get("size", [])) != SIZE:
        raise ValueError("Incompatible segmentation artifact")
    image = decode_image(base64.b64encode(image_path.read_bytes()).decode())
    started = time.perf_counter()
    mask = mask_from_probability(probability(artifact["model"], image), artifact["threshold"], (image.shape[1],image.shape[0]))
    result = dict(experimental=True, productionEnabled=False, image=str(image_path),
        width=image.shape[1],height=image.shape[0],foregroundPixels=int(np.count_nonzero(mask)),
        inferenceMs=round((time.perf_counter()-started)*1000,2),lengthMm=None,weightG=None,
        warning="Predicted foreground only. Inspect visually; no calibration or reliable confidence estimate. Not validated on your camera.")
    output.mkdir(parents=True,exist_ok=False)
    cv2.imwrite(str(output/"mask.png"),mask)
    (output/"result.json").write_text(json.dumps(result,indent=2),encoding="utf-8")
    print(json.dumps(result,indent=2))
    return result


if __name__=="__main__":
    parser=argparse.ArgumentParser()
    parser.add_argument("image",type=Path)
    parser.add_argument("--model",type=Path,default=Path("artifacts/p3-segmentation-v1/segmentation.joblib"))
    parser.add_argument("--output",type=Path,required=True)
    args=parser.parse_args()
    predict(args.image,args.model,args.output)
