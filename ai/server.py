"""Loopback-only, authenticated, single-image inference service."""
import hmac
import json
import os
import threading
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

from pipeline import analyze
from forecast import predict

lock = threading.Lock()


class Handler(BaseHTTPRequestHandler):
    def reply(self, status, body):
        payload = json.dumps(body, allow_nan=False).encode()
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(payload)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(payload)

    def do_POST(self):
        self.connection.settimeout(15)
        key = os.environ.get("GROWTH_AI_KEY", "")
        if not key or not hmac.compare_digest(self.headers.get("Authorization", ""), "Bearer " + key):
            self.reply(401, {"error": "Unauthorized"})
            return
        if self.path not in ("/analyze", "/forecast"):
            self.reply(404, {"error": "Not found"})
            return
        if not lock.acquire(blocking=False):
            self.reply(503, {"error": "Analysis busy"})
            return
        try:
            size = int(self.headers.get("Content-Length", "0"))
            if not 0 < size <= 12 * 1024 * 1024:
                self.reply(413, {"error": "Payload too large"})
                return
            payload = json.loads(self.rfile.read(size))
            if self.path == "/forecast":
                self.reply(200, predict(payload["sessions"], os.environ.get("GROWTH_FORECAST_MODEL", "artifacts/forecast.joblib")))
            else:
                self.reply(200, analyze(payload["image"], payload["calibration"]))
        except (ValueError, TypeError, KeyError):
            self.reply(400, {"error": "Invalid image or calibration"})
        except Exception:
            self.reply(500, {"error": "Analysis failed"})
        finally:
            lock.release()

    def log_message(self, *_):
        pass  # Do not log image payloads or authentication headers.


if __name__ == "__main__":
    if len(os.environ.get("GROWTH_AI_KEY", "")) < 24:
        raise SystemExit("Set GROWTH_AI_KEY to a random secret of at least 24 characters")
    print("EcoPrawn inference listening on 127.0.0.1:8010; one image at a time")
    ThreadingHTTPServer(("127.0.0.1", 8010), Handler).serve_forever()
