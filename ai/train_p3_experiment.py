"""Train once, select on validation, evaluate fixed specimen and capture-group holdouts."""
import argparse
import base64
from collections import Counter
import csv
from datetime import datetime, timezone
import hashlib
import html
import json
from pathlib import Path
import re
import time

import cv2
import joblib
import numpy as np
from sklearn.ensemble import ExtraTreesClassifier, ExtraTreesRegressor
from sklearn.linear_model import LinearRegression

from segmentation import FEATURE_VERSION, SIZE, features, probability, mask_from_probability, baseline, overlap, geometry

SEED = 20261108


def read_dataset(root):
    if not (root / "labels.csv").exists():
        root /= "P3_DATASET_RELEASE"
    with (root / "labels.csv").open(encoding="utf-8-sig", newline="") as stream:
        rows = list(csv.DictReader(stream))
    checksums = dict((name.lstrip("*"), checksum) for checksum, name in
                     (line.split(maxsplit=1) for line in (root / "checksums.sha256").read_text().splitlines()))
    identities = set()
    for row in rows:
        row["key"] = row["base"] + ":" + row["muestra_mendeley"]
        if row["key"] in identities:
            raise ValueError("Duplicate specimen identity")
        identities.add(row["key"])
        row["imagePath"] = f"{row['base']}/{row['archivo']}"
        row["maskPath"] = row["base"] + "/" + re.sub(r"_frame\d+\.png$", "_mask_full.png", row["archivo"])
        for name in [row["imagePath"], row["maskPath"]]:
            if hashlib.sha256((root / name).read_bytes()).hexdigest() != checksums[name]:
                raise ValueError("Dataset checksum mismatch: " + name)
        row["disputed"] = row["etiqueta_en_disputa"].lower() == "true"
    return root, rows


def split_dataset(rows):
    rng = np.random.default_rng(SEED)
    partitions = {name: [] for name in ["train", "validation", "test", "domain_test"]}
    for group in sorted({r["base"] for r in rows}):
        group_rows = sorted([r for r in rows if r["base"] == group], key=lambda r: int(r["muestra_mendeley"]))
        if group == "DB5":
            partitions["domain_test"].extend(group_rows)
            continue
        order = rng.permutation(len(group_rows))
        n = round(len(group_rows) * .2)
        for i, index in enumerate(order):
            name = "validation" if i < n else "test" if i < 2*n else "train"
            partitions[name].append(group_rows[index])
    return partitions


def load(root, row):
    image = cv2.imread(str(root / row["imagePath"]))
    mask = cv2.imread(str(root / row["maskPath"]), cv2.IMREAD_GRAYSCALE)
    if image is None or mask is None or image.shape[:2] != mask.shape or set(np.unique(mask)) != {0, 255}:
        raise ValueError("Invalid image/mask pair")
    return image, mask


def train_pixels(root, rows):
    rng = np.random.default_rng(SEED)
    all_x, all_y = [], []
    for row in rows:
        image, mask = load(root, row)
        x = features(image)
        y = (cv2.resize(mask, SIZE, interpolation=cv2.INTER_NEAREST) > 0).ravel()
        # Uniform class-balanced samples from each training specimen only.
        indices = np.concatenate([rng.choice(np.flatnonzero(y == value), size=min(800, int((y == value).sum())), replace=False) for value in [False, True]])
        all_x.append(x[indices]); all_y.append(y[indices])
    model = ExtraTreesClassifier(n_estimators=64, max_depth=18, min_samples_leaf=5,
        max_features=.7, random_state=SEED, n_jobs=4)
    print(f"Fitting pixel model on {sum(map(len, all_y))} pixels from {len(rows)} training specimens", flush=True)
    model.fit(np.concatenate(all_x), np.concatenate(all_y))
    return model


def select_thresholds(root, rows, model):
    forest_thresholds, baseline_thresholds = [.35, .5, .65], [.03, .05, .08]
    scores = {"forest": {str(t): [] for t in forest_thresholds}, "baseline": {str(t): [] for t in baseline_thresholds}}
    for row in rows:
        image, mask = load(root, row)
        prob = probability(model, image)
        size = (image.shape[1], image.shape[0])
        for t in forest_thresholds:
            scores["forest"][str(t)].append(overlap(mask_from_probability(prob, t, size), mask)["dice"])
        for t in baseline_thresholds:
            scores["baseline"][str(t)].append(overlap(baseline(image, t), mask)["dice"])
    means = {kind: {t: float(np.mean(values)) for t, values in candidates.items()} for kind, candidates in scores.items()}
    return {kind: float(max(candidates, key=candidates.get)) for kind, candidates in means.items()}, means


def predict_rows(root, rows, model, thresholds, output):
    results = []
    for i, row in enumerate(rows):
        image, target = load(root, row)
        started = time.perf_counter()
        prediction = mask_from_probability(probability(model, image), thresholds["forest"], (image.shape[1], image.shape[0]))
        duration = (time.perf_counter() - started) * 1000
        base = baseline(image, thresholds["baseline"])
        mask_name = row["key"].replace(":", "_") + ".png"
        cv2.imwrite(str(output / "masks" / mask_name), prediction)
        results.append(dict(key=row["key"], group=row["base"], disputed=row["disputed"],
            imagePath=row["imagePath"], targetPath=row["maskPath"], predictedMask="masks/" + mask_name,
            model=overlap(prediction, target), baseline=overlap(base, target), geometry=geometry(prediction),
            measuredWeightG=float(row["peso_g"]), latencyMs=duration))
        if (i+1) % 10 == 0:
            print(f"Predicted {i+1}/{len(rows)}", flush=True)
    return results


def summarize_segmentation(rows):
    def scores(items):
        return {kind: {metric: float(np.mean([r[kind][metric] for r in items])) for metric in ["dice", "iou"]} for kind in ["model", "baseline"]}
    return dict(count=len(rows), **scores(rows), byGroup={g: scores([r for r in rows if r["group"] == g]) for g in sorted({r["group"] for r in rows})},
        failedMasks=sum(r["geometry"] is None for r in rows), p95InferenceMs=float(np.percentile([r["latencyMs"] for r in rows],95)))


def regression_metrics(y, prediction):
    y, prediction = np.asarray(y), np.asarray(prediction)
    return {"count":len(y), "maeG":float(np.mean(abs(prediction-y))), "meanRelativeError":float(np.mean(abs(prediction-y)/y)), "biasG":float(np.mean(prediction-y))} if len(y) else None


def train_weight(train, validation):
    usable = lambda rows: [r for r in rows if not r["disputed"] and r["geometry"] is not None]
    tr, va = usable(train), usable(validation)
    x, y = np.array([r["geometry"] for r in tr]), np.array([r["measuredWeightG"] for r in tr])
    forest = ExtraTreesRegressor(n_estimators=128, max_depth=8, min_samples_leaf=3, random_state=SEED, n_jobs=4).fit(x, y)
    power = LinearRegression().fit(np.log(x[:, :1]), np.log(y))
    artifact = dict(kind="experimental-pixel-geometry-weight-v1", forest=forest, power=power, median=float(np.median(y)),
                    enabled=False, calibrated=False, trainingKeys=[r["key"] for r in tr])
    scores = evaluate_weight(va, artifact)
    # Select only on validation, choosing the area power law within 1% MAE.
    artifact["selected"] = "forest" if scores["forest"]["maeG"] < scores["power"]["maeG"]*.99 else "power"
    return artifact, scores


def evaluate_weight(rows, artifact):
    valid = [r for r in rows if r["geometry"] is not None]
    if not valid:
        return {}
    x, y = np.array([r["geometry"] for r in valid]), np.array([r["measuredWeightG"] for r in valid])
    predictions = {"forest": artifact["forest"].predict(x), "power": np.exp(artifact["power"].predict(np.log(x[:, :1]))),
                   "constant": np.full(len(y), artifact["median"])}
    return {name: regression_metrics(y, prediction) for name, prediction in predictions.items()}


def preview(root, rows, output):
    def contours(mask, color):
        found, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        return "".join(f'<polygon points="{" ".join(f"{x},{y}" for x,y in cv2.approxPolyDP(c,1,True).reshape(-1,2))}" fill="none" stroke="{color}" stroke-width="2"/>' for c in found if cv2.contourArea(c)>20)
    cards = []
    for cohort in ["test", "domain_test"]:
        subset = sorted(rows[cohort], key=lambda r:r["model"]["dice"])
        for index, label in [(0,"lowest overlap"), (len(subset)//2,"middle overlap"), (len(subset)-1,"highest overlap")]:
            r = subset[index]
            raw = base64.b64encode((root/r["imagePath"]).read_bytes()).decode()
            target = cv2.imread(str(root/r["targetPath"]),0)
            pred = cv2.imread(str(output/r["predictedMask"]),0)
            cards.append(f'<article><h3>{cohort}: {html.escape(r["key"])} · {label}</h3><p>Dice {r["model"]["dice"]:.3f}; IoU {r["model"]["iou"]:.3f}</p><svg viewBox="0 0 640 480"><image href="data:image/png;base64,{raw}" width="640" height="480"/>{contours(target,"#fb4d70")}{contours(pred,"#00dca5")}</svg></article>')
    document = '<!doctype html><html><meta charset="utf-8"><title>EcoPrawn experimental segmentation</title><style>body{font:16px system-ui;background:#10282a;color:#eef7f4;padding:28px;margin:0}h1{margin:0 0 10px}main{display:grid;grid-template-columns:repeat(3,1fr);gap:18px}article{background:#203a3c;border-radius:12px;padding:14px}h3{font-size:15px;margin:0}svg{width:100%}p{font-size:14px;color:#d4e3dd}</style><h1>Real shrimp images: held-out segmentation results</h1><p>Green = model prediction. Pink = human reference. Examples include lowest, middle and highest overlap from each holdout. No length or weight calibration.</p><main>'+"".join(cards)+'</main><p>Images: Ramirez-Coronel et al., Mendeley P3 subset, CC BY 4.0, DOI 10.17632/n244f3kyd3.1. Analytical contour overlays added by EcoPrawn.</p></html>'
    (output/"preview.html").write_text(document,encoding="utf-8")


def run(root, output):
    root, rows = read_dataset(root)
    output.mkdir(parents=True, exist_ok=False)
    (output/"masks").mkdir()
    partitions = split_dataset(rows)
    config = dict(seed=SEED, featureVersion=FEATURE_VERSION, imageSize=SIZE, domainHoldout="DB5",
        partitions={name:[r["key"] for r in values] for name,values in partitions.items()},
        source="https://data.mendeley.com/datasets/n244f3kyd3/1", license="CC BY 4.0",
        labelsSha256=hashlib.sha256((root/"labels.csv").read_bytes()).hexdigest())
    (output/"split-manifest.json").write_text(json.dumps(config,indent=2))
    print("Locked partitions: "+str({k:len(v) for k,v in partitions.items()}),flush=True)
    model = train_pixels(root, partitions["train"])
    thresholds, validation_scores = select_thresholds(root,partitions["validation"],model)
    print("Validation choices: "+str(thresholds),flush=True)
    joblib.dump(dict(kind="experimental-p3-segmentation-v1",model=model,featureVersion=FEATURE_VERSION,
        threshold=thresholds["forest"],size=SIZE,productionEnabled=False),output/"segmentation.joblib",compress=3)
    # Freeze segmentation selection before inspecting either test set.
    (output/"selection.json").write_text(json.dumps(dict(thresholds=thresholds,validation=validation_scores),indent=2))
    predictions={}
    for name in ["train","validation"]:
        print("Predicting "+name,flush=True)
        predictions[name]=predict_rows(root,partitions[name],model,thresholds,output)
    weight, weight_validation = train_weight(predictions["train"],predictions["validation"])
    joblib.dump(weight,output/"experimental-weight.joblib",compress=3)
    print("Weight selection locked: "+weight["selected"],flush=True)
    for name in ["test","domain_test"]:
        print("Final evaluation "+name,flush=True)
        predictions[name]=predict_rows(root,partitions[name],model,thresholds,output)
    report=dict(createdAtUtc=datetime.now(timezone.utc).isoformat(),config=config,
        segmentationValidation=validation_scores,thresholds=thresholds,
        segmentation={name:summarize_segmentation(predictions[name]) for name in ["validation","test","domain_test"]},
        weight={"selected":weight["selected"],"trainingCount":len(weight["trainingKeys"]),"validation":weight_validation,
            "testUndisputed":evaluate_weight([r for r in predictions["test"] if not r["disputed"]],weight),
            "testIncludingDisputed":evaluate_weight(predictions["test"],weight),
            "domainUndisputed":evaluate_weight([r for r in predictions["domain_test"] if not r["disputed"]],weight)},
        productionEnabled=False,
        weightCoverage={name:dict(eligible=sum(not r["disputed"] for r in values),
            usable=sum(not r["disputed"] and r["geometry"] is not None for r in values))
            for name,values in predictions.items()},
        limitations=["No local camera evaluation or independent physical calibration.",
            "DB5 is one held-out dataset condition, not evidence of arbitrary-camera transfer.",
            "Weight uses predicted geometry in pixels and may depend on acquisition scale.",
            "Weight training masks are in-sample segmentation predictions; final weight tests use unseen specimens.",
            "No temporal data, no forecasting, no use of px_por_cm_base, manual length or weight-defined cohort as a feature.",
            "Do not tune this version against its now-observed test sets."])
    (output/"evaluation.json").write_text(json.dumps(report,indent=2))
    (output/"predictions.json").write_text(json.dumps(predictions,indent=2))
    preview(root,predictions,output)
    print(json.dumps({"segmentation":report["segmentation"],"weight":report["weight"]},indent=2),flush=True)
    return report


if __name__=="__main__":
    p=argparse.ArgumentParser()
    p.add_argument("dataset",type=Path)
    p.add_argument("--output",type=Path,required=True)
    args=p.parse_args()
    run(args.dataset,args.output)
