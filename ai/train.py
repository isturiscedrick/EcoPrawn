"""Reproducible weight experiment from exported manifests. Never trains inside the service."""
import argparse
import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path
import joblib
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.linear_model import LinearRegression
from pipeline import ALGORITHM, FEATURES


def specimen(row):
    return (row["tankId"], row["batch"], row["specimenId"])


def metrics(actual, predicted):
    actual, predicted = np.asarray(actual), np.asarray(predicted)
    if not len(actual):
        return None
    error = predicted - actual
    return dict(count=len(actual), mae=float(np.mean(abs(error))), bias=float(np.mean(error)),
                meanRelativeError=float(np.mean(abs(error) / actual)))


def load_manifests(paths):
    rows, ids = [], set()
    for path in paths:
        payload = json.loads(Path(path).read_text())
        if not isinstance(payload, list):
            raise ValueError("Manifest must be an array")
        for row in payload:
            if row["imageId"] not in ids:
                rows.append(row)
                ids.add(row["imageId"])
    return rows


def split_rows(rows):
    # Split whole sessions in date order, then purge earlier appearances of a specimen
    # assigned to a later split. Repeated photos never straddle partitions.
    session_dates = {}
    for row in rows:
        session_dates[row["sessionId"]] = row["sampledAt"]
    sessions = sorted(session_dates, key=lambda s: (session_dates[s], s))
    if len(sessions) < 10:
        raise ValueError("Collect at least 10 distinct sessions before training")
    first, second = int(len(sessions) * .6), int(len(sessions) * .8)
    partition = {s: 0 if i < first else 1 if i < second else 2 for i, s in enumerate(sessions)}
    latest = {}
    for row in rows:
        key = specimen(row)
        latest[key] = max(latest.get(key, 0), partition[row["sessionId"]])
    splits = [[], [], []]
    seen = set()
    for row in sorted(rows, key=lambda r: r["capturedAt"], reverse=True):
        part = partition[row["sessionId"]]
        identity = (row["sessionId"], specimen(row))
        if part == latest[specimen(row)] and identity not in seen:
            splits[part].append(row)
            seen.add(identity)
    return splits


def usable(row):
    original = row.get("original", {})
    values = [row.get("manualLengthMm"), row.get("measuredWeightG")] + [original.get(k) for k in FEATURES]
    return (row.get("status") == "approved" and original.get("status") == "review" and
            original.get("algorithm") == ALGORITHM and
            all(isinstance(v, (int, float)) and not isinstance(v, bool) and np.isfinite(v) and v > 0 for v in values))


def train(rows, output):
    output = Path(output)
    if output.exists():
        raise ValueError("Use a new output directory for each experiment; do not overwrite held-out evaluation")
    eligible = [r for r in rows if usable(r)]
    if len({specimen(r) for r in eligible}) < 300:
        raise ValueError("Collect 300 independently labeled specimens before model activation experiments")
    train_rows, validation, test = split_rows(eligible)
    if min(map(len, (train_rows, validation, test))) < 20:
        raise ValueError("Need at least 20 usable records in each partition after leakage removal")
    def arrays(group):
        return np.array([[r["original"][k] for k in FEATURES] for r in group]), np.array([r["measuredWeightG"] for r in group])
    x, y = arrays(train_rows)
    vx, vy = arrays(validation)
    models = {"power": LinearRegression().fit(np.log(x[:, :1]), np.log(y)),
              "forest": RandomForestRegressor(n_estimators=200, min_samples_leaf=3, random_state=42, n_jobs=1).fit(x, y)}
    def predict(kind, features):
        return np.exp(models[kind].predict(np.log(features[:, :1]))) if kind == "power" else models[kind].predict(features)
    validation_scores = {kind: metrics(vy, predict(kind, vx)) for kind in models}
    # Within 1% MAE, retain the simpler power-law baseline. Test set does not choose the model.
    selected = "forest" if validation_scores["forest"]["mae"] < validation_scores["power"]["mae"] * .99 else "power"
    tx, ty = arrays(test)
    score = metrics(ty, predict(selected, tx))
    length_score = metrics([r["manualLengthMm"] for r in test], tx[:, 0])
    corrected = [r for r in test if r.get("correction") and r["correction"].get("lengthMm")]
    corrected_score = metrics([r["manualLengthMm"] for r in corrected], [r["correction"]["lengthMm"] for r in corrected])
    latency = float(np.percentile([r["original"]["latencyMs"] for r in test], 95))
    enabled = score["meanRelativeError"] <= .15 and length_score["meanRelativeError"] <= .05 and latency <= 10000
    digest = hashlib.sha256(json.dumps(rows, sort_keys=True).encode()).hexdigest()
    version = "weight-" + digest[:12]
    report = dict(version=version, datasetSha256=digest, createdAt=datetime.now(timezone.utc).isoformat(),
                  enabled=enabled, selected=selected, validation=validation_scores, testWeight=score,
                  testLengthMm=length_score, correctedLengthMm=corrected_score,
                  correctedWeight="Not evaluated; corrected outputs cannot produce weight estimates.",
                  rejectionRate=sum(r.get("original", {}).get("status") == "rejected" for r in rows) / max(1, len(rows)),
                  p95AnalysisMs=latency, splitImageIds=[[r["imageId"] for r in group] for group in [train_rows, validation, test]],
                  limitations="Tray images only. Latency excludes upload, storage and UI. Independent on-device end-to-end benchmark still required.")
    # Fixed training-derived terciles provide size-stratified results without test-driven bins.
    bins = np.quantile(x[:, 0], [1/3, 2/3])
    actual_lengths = np.array([r["manualLengthMm"] for r in test])
    report["bySize"] = {name: {"weightG": metrics(ty[mask], predict(selected, tx)[mask]),
                              "lengthMm": metrics(actual_lengths[mask], tx[:, 0][mask])} for name, mask in [
        ("small", tx[:, 0] <= bins[0]), ("medium", (tx[:, 0] > bins[0]) & (tx[:, 0] <= bins[1])), ("large", tx[:, 0] > bins[1])]}
    ranges = [[float(max(x[:, i].min(), tx[:, i].min())), float(min(x[:, i].max(), tx[:, i].max()))] for i in range(3)]
    artifact = dict(version=version, enabled=enabled, algorithm=ALGORITHM, kind=selected,
                    model=models[selected], featureRanges=ranges, report=report)
    output.mkdir(parents=True)
    joblib.dump(artifact, output / "weight.joblib")
    (output / "evaluation.json").write_text(json.dumps(report, indent=2, allow_nan=False))
    print(json.dumps({"enabled": enabled, "version": version, "report": str(output / "evaluation.json")}, indent=2))
    return report


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("manifests", nargs="+")
    parser.add_argument("--output", required=True)
    args = parser.parse_args()
    train(load_manifests(args.manifests), args.output)
