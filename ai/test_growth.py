import base64
import json
import tempfile
import unittest
from datetime import datetime, timedelta, timezone
import threading
import urllib.request
import urllib.error
from unittest.mock import patch
from pathlib import Path
import cv2
import numpy as np
from pipeline import analyze, calibration_valid, estimate_weight
from train import split_rows, train
from forecast import experiment, predict


def fixture(marker=True, bodies=1, clipped=False):
    image = np.full((600, 800, 3), 25, np.uint8)
    if marker:
        image[40:160, 40:160] = 255
        code = cv2.aruco.generateImageMarker(cv2.aruco.getPredefinedDictionary(cv2.aruco.DICT_4X4_50), 0, 80)
        image[60:140, 60:140] = cv2.cvtColor(code, cv2.COLOR_GRAY2BGR)
    for i in range(bodies):
        cv2.ellipse(image, (20 if clipped else 420, 300 + i * 160), (140, 28), 15, 0, 360, (190, 190, 190), -1)
    return image


CALIBRATION = dict(version="test-v1", setupId="test-tray", width=800, height=600, markerMm=20,
                   cameraMatrix=[[800, 0, 400], [0, 800, 300], [0, 0, 1]], distortion=[0] * 5)


def run(image, calibration=None):
    _, encoded = cv2.imencode(".png", image)
    return analyze(base64.b64encode(encoded).decode(), calibration or CALIBRATION)["analysis"]


class GrowthTests(unittest.TestCase):
    def test_valid_synthetic_tray_requires_review(self):
        result = run(fixture())
        self.assertEqual(result["status"], "review", result)
        self.assertGreater(result["lengthMm"], 40)
        self.assertIsNone(result["weightG"])
        self.assertGreater(len(result["path"]), 1)

    def test_rejections(self):
        for image, reason in [(fixture(marker=False), "marker"), (fixture(bodies=0), "No measurable"),
                              (fixture(bodies=2), "Multiple"), (fixture(clipped=True), "clipped")]:
            result = run(image)
            self.assertEqual(result["status"], "rejected", result)
            self.assertIn(reason.lower(), result["reason"].lower())

    def test_blur_and_reflection(self):
        blurred = cv2.GaussianBlur(fixture(), (41, 41), 20)
        self.assertEqual(run(blurred)["status"], "rejected")
        reflected = fixture()
        cv2.rectangle(reflected, (650, 420), (720, 480), (255, 255, 255), -1)
        self.assertEqual(run(reflected)["status"], "rejected")
        overlap = fixture(bodies=0)
        cv2.line(overlap, (250, 200), (550, 450), (190, 190, 190), 35)
        cv2.line(overlap, (550, 200), (250, 450), (190, 190, 190), 35)
        self.assertEqual(run(overlap)["status"], "rejected")

    def test_calibration_and_invalid_image(self):
        self.assertFalse(calibration_valid({}))
        self.assertIn("Resolution", run(fixture(), {**CALIBRATION, "width": 801})["reason"])
        with self.assertRaises(ValueError):
            analyze("aW52YWxpZA==", CALIBRATION)

    def test_missing_model_and_forecast_gate(self):
        self.assertIsNone(estimate_weight({"lengthMm": 10, "areaMm2": 20, "widthMm": 2}, "missing.joblib")[0])
        self.assertFalse(predict([], "missing.joblib")["enabled"])
        with self.assertRaises(ValueError):
            experiment([], "unused-output")

    def test_split_no_specimen_or_session_leak(self):
        rows = [dict(sessionId=f"s{i}", sampledAt=f"2026-01-{i+1:02d}", capturedAt=f"2026-01-{i+1:02d}",
                     tankId="t", batch="b", specimenId=f"animal{i}") for i in range(10)]
        rows.append({**rows[0], "sessionId": "s9", "sampledAt": "2026-01-10", "capturedAt": "2026-01-10"})
        splits = split_rows(rows)
        for i in range(3):
            for j in range(i):
                self.assertFalse({r["specimenId"] for r in splits[i]} & {r["specimenId"] for r in splits[j]})
                self.assertFalse({r["sessionId"] for r in splits[i]} & {r["sessionId"] for r in splits[j]})

    def test_training_refuses_no_data(self):
        with self.assertRaises(ValueError):
            train([], "unused-output")

    def test_forecast_baseline_gate(self):
        rows = []
        start = datetime(2026, 1, 1, tzinfo=timezone.utc)
        for batch in range(3):
            for week in range(16):
                rows.append(dict(sessionId=f"b{batch}-w{week}", tankId="tank", batch=str(batch), specimenId=f"a{week}",
                    sampledAt=(start + timedelta(days=week * 7)).isoformat(), stockedAt=start.isoformat(),
                    status="approved", measuredWeightG=10 + week))
        Path("artifacts").mkdir(exist_ok=True)
        with tempfile.TemporaryDirectory(dir="artifacts") as directory:
            report = experiment(rows, Path(directory) / "forecast")
            self.assertFalse(report["enabled"], "Ridge must not beat a perfect linear baseline")
            self.assertFalse(predict([], Path(directory) / "forecast/forecast.joblib")["enabled"])

    def test_service_auth_and_analysis(self):
        from http.server import ThreadingHTTPServer
        from server import Handler
        service = ThreadingHTTPServer(("127.0.0.1", 0), Handler)
        thread = threading.Thread(target=service.serve_forever, daemon=True)
        thread.start()
        url = f"http://127.0.0.1:{service.server_port}/analyze"
        try:
            with patch.dict("os.environ", {"GROWTH_AI_KEY": "test-service-key-1234567890"}):
                with self.assertRaises(urllib.error.HTTPError) as error:
                    urllib.request.urlopen(urllib.request.Request(url, data=b"{}"), timeout=5)
                self.assertEqual(error.exception.code, 401)
                error.exception.close()
                _, image = cv2.imencode(".png", fixture())
                data = json.dumps({"image": base64.b64encode(image).decode(), "calibration": CALIBRATION}).encode()
                request = urllib.request.Request(url, data=data, headers={"Authorization": "Bearer test-service-key-1234567890", "Content-Type": "application/json"})
                with urllib.request.urlopen(request, timeout=5) as response:
                    self.assertEqual(json.load(response)["analysis"]["status"], "review")
        finally:
            service.shutdown(); service.server_close(); thread.join()

    def test_reproducible_training_and_disabled_bad_model(self):
        # Synthetic labels exercise evaluation code only, never establish biological accuracy.
        rows = []
        for session in range(10):
            for n in range(30):
                length = 50 + n
                rows.append(dict(sessionId=f"s{session}", tankId="t", batch="b", specimenId=f"a{session}-{n}",
                    imageId=f"i{session}-{n}", sampledAt=f"2026-01-{session+1:02d}", capturedAt=f"2026-01-{session+1:02d}",
                    status="approved", manualLengthMm=length, measuredWeightG=.0001 * length ** 3,
                    original=dict(algorithm="tray-centerline-v1", status="review", lengthMm=length,
                                  areaMm2=length*10, widthMm=10, latencyMs=10), correction=None))
        Path("artifacts").mkdir(exist_ok=True)
        with tempfile.TemporaryDirectory(dir="artifacts") as directory:
            report = train(rows, Path(directory) / "good")
            self.assertTrue(report["enabled"])
            value, _, _ = estimate_weight(rows[0]["original"], Path(directory) / "good/weight.joblib")
            self.assertAlmostEqual(value, rows[0]["measuredWeightG"], places=4)
            self.assertIsNone(estimate_weight({"lengthMm": 1, "areaMm2": 1, "widthMm": 1}, Path(directory) / "good/weight.joblib")[0])
            for row in rows:
                row["manualLengthMm"] *= 2
            report = train(rows, Path(directory) / "bad")
            self.assertFalse(report["enabled"])


if __name__ == "__main__":
    unittest.main()
