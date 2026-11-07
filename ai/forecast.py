"""Seven-day forecasting experiment. Requires independently weighed weekly samples."""
import argparse
import hashlib
import json
from datetime import datetime, timedelta
from pathlib import Path
import joblib
import numpy as np
from sklearn.linear_model import Ridge
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from train import load_manifests, metrics


def timestamp(value):
    return datetime.fromisoformat(value.replace("Z", "+00:00"))


def weekly_sessions(rows):
    sessions = {}
    for row in rows:
        if row["status"] != "approved" or not row.get("measuredWeightG"):
            continue
        session = sessions.setdefault(row["sessionId"], dict(date=row["sampledAt"], stockedAt=row["stockedAt"],
            tankId=row["tankId"], batch=row["batch"], specimens={}))
        session["specimens"][row["specimenId"]] = row["measuredWeightG"]
    groups = {}
    for session in sessions.values():
        session["weightG"] = float(np.mean(list(session.pop("specimens").values())))
        groups.setdefault((session["tankId"], session["batch"]), []).append(session)
    valid = []
    for group in groups.values():
        group.sort(key=lambda s: s["date"])
        # One observation per culture week. Dense same-day captures cannot satisfy the gate.
        weeks = {int((timestamp(s["date"]) - timestamp(s["stockedAt"])).days // 7) for s in group}
        if len(weeks) >= 12:
            valid.append(group)
    return valid


def experiment(rows, output):
    groups = weekly_sessions(rows)
    if len(groups) < 3:
        raise ValueError("Need at least 12 distinct culture weeks in each of three tank/batch groups")
    pairs = []
    for group in groups:
        for previous, current, future in zip(group, group[1:], group[2:]):
            gap = (timestamp(future["date"]) - timestamp(current["date"])).total_seconds() / 86400
            elapsed = (timestamp(current["date"]) - timestamp(previous["date"])).total_seconds() / 86400
            if not 6 <= gap <= 8 or not 6 <= elapsed <= 8:
                continue
            rate = (current["weightG"] - previous["weightG"]) / elapsed
            age = (timestamp(current["date"]) - timestamp(current["stockedAt"])).total_seconds() / 86400
            pairs.append(dict(date=current["date"], targetDate=future["date"], x=[current["weightG"], rate, age], y=future["weightG"]))
    dates = sorted({p["date"] for p in pairs})
    if len(dates) < 10:
        raise ValueError("Not enough weekly prediction pairs")
    cutoff1, cutoff2 = dates[int(len(dates) * .6)], dates[int(len(dates) * .8)]
    partitions = [[p for p in pairs if p["targetDate"] < cutoff1],
                  [p for p in pairs if p["date"] >= cutoff1 and p["targetDate"] < cutoff2],
                  [p for p in pairs if p["date"] >= cutoff2]]
    if min(map(len, partitions)) < 3:
        raise ValueError("Insufficient chronological train/validation/test pairs after boundary purging")
    arrays = lambda group: (np.array([p["x"] for p in group]), np.array([p["y"] for p in group]))
    x, y = arrays(partitions[0])
    model = make_pipeline(StandardScaler(), Ridge(alpha=1.0)).fit(x, y)
    def evaluate(group):
        features, truth = arrays(group)
        return {"ridge": metrics(truth, model.predict(features)), "persistence": metrics(truth, features[:, 0]),
                "linear": metrics(truth, features[:, 0] + features[:, 1] * 7)}
    validation, test = evaluate(partitions[1]), evaluate(partitions[2])
    enabled = all(scores["ridge"]["mae"] < min(scores["persistence"]["mae"], scores["linear"]["mae"]) for scores in [validation, test])
    version = "forecast-" + hashlib.sha256(json.dumps(rows, sort_keys=True).encode()).hexdigest()[:12]
    report = dict(version=version, enabled=enabled, horizonDays=7, validation=validation, test=test,
                  counts=list(map(len, partitions)), cutoffDates=[cutoff1, cutoff2],
                  input="Independently weighed session averages; estimated weights are not substituted.")
    destination = Path(output)
    destination.mkdir(parents=True, exist_ok=False)
    joblib.dump(dict(model=model, report=report, enabled=enabled, version=version,
                    ranges=np.column_stack([x.min(axis=0), x.max(axis=0)]).tolist()), destination / "forecast.joblib")
    (destination / "evaluation.json").write_text(json.dumps(report, indent=2))
    return report


def predict(sessions, model_path):
    path = Path(model_path)
    if not path.is_file():
        return {"enabled": False, "reason": "No validated forecasting model installed."}
    artifact = joblib.load(path)
    if not artifact["enabled"]:
        return {"enabled": False, "reason": "Forecasting experiment did not outperform both baselines."}
    observations = sorted([s for s in sessions if s.get("measuredWeightG")], key=lambda s: s["sampledAt"])
    if len(observations) < 2:
        return {"enabled": False, "reason": "Two independently weighed weekly sessions are required."}
    previous, current = observations[-2:]
    days = (timestamp(current["sampledAt"]) - timestamp(previous["sampledAt"])).total_seconds() / 86400
    if not 6 <= days <= 8:
        return {"enabled": False, "reason": "Latest measurements are not one week apart."}
    rate = (current["measuredWeightG"] - previous["measuredWeightG"]) / days
    age = (timestamp(current["sampledAt"]) - timestamp(current["stockedAt"])).total_seconds() / 86400
    features = np.array([[current["measuredWeightG"], rate, age]])
    ranges = np.array(artifact["ranges"])
    if np.any(features[0] < ranges[:, 0]) or np.any(features[0] > ranges[:, 1]):
        return {"enabled": False, "reason": "Outside the validated forecasting range."}
    weight = float(artifact["model"].predict(features)[0])
    if not np.isfinite(weight) or weight <= 0:
        return {"enabled": False, "reason": "Invalid forecast output."}
    return dict(enabled=True, weightG=weight, forecastDate=(timestamp(current["sampledAt"]) + timedelta(days=7)).isoformat(),
                modelVersion=artifact["version"], validationMaeG=artifact["report"]["test"]["ridge"]["mae"])


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("manifests", nargs="+")
    parser.add_argument("--output", required=True)
    args = parser.parse_args()
    print(json.dumps(experiment(load_manifests(args.manifests), args.output), indent=2))
