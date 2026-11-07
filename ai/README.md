# Shrimp growth sampling and local AI

This is a supervised sampling workflow for a fixed overhead camera and a dark tray. It is not an in-tank detector. No real shrimp dataset or trained production model is included. The app displays unavailable weight and forecasting results until an evaluated artifact is installed.

## Setup

Use Python 3.14 and the pinned `requirements.txt`. From `ai/` on Windows:

```powershell
python -m venv .venv
.venv/Scripts/python -m pip install -r requirements.txt
.venv/Scripts/python -m unittest test_growth -v
```

The backend needs the additive `GrowthSession` and `GrowthMeasurement` tables. Stop backend development servers before Prisma CLI operations on Windows. For a disposable local database, run `bun run db:push` in `backend/`. For the existing hosted `ecoprawn` schema, review and apply `backend/prisma/add-growth.sql` once, then run `bun run db:generate`. The migration enables RLS and blocks browser database roles, matching the existing backend-only access pattern. It has not been applied automatically to a live database.

Set these variables in the backend environment:

```dotenv
GROWTH_AI_URL=http://127.0.0.1:8010
GROWTH_AI_KEY=replace-with-a-random-secret-at-least-24-characters
GROWTH_STORAGE_DIR=C:/EcoPrawn/private-growth-images
GROWTH_STORAGE_MAX_BYTES=1073741824
GROWTH_FORECAST_ENABLED=false
```

Choose a private directory outside any public web folder, preferably outside OneDrive. Use filesystem permissions to restrict it to the app account. The default is `.growth-storage` relative to the backend working directory. Images are available only through authenticated, owner-checked API requests.

Set the same `GROWTH_AI_KEY` in the Python service process, then start it from `ai/`:

```powershell
$env:GROWTH_AI_KEY = 'your-random-secret'
.venv/Scripts/python server.py
```

The service binds only to `127.0.0.1:8010`. It accepts one image at a time and returns busy for simultaneous requests. Restart the backend after environment changes. Run both existing Bun apps normally. Local inference still uses the application's existing online sign-in flow.

## Camera calibration and capture protocol

1. Secure access to shrimp and agree on a sampling and handling procedure with the responsible operator. Begin with 30 specimens to establish whether the actual camera can produce clear body outlines. Do not start a live-animal handling trial solely from these software instructions.
2. Use a matte dark tray, diffuse lighting, one shrimp per image, a fixed camera mount and fixed resolution. Keep the body and reference in the same measurement plane. Any water depth must be fixed and included in calibration trials. A marker cannot correct unknown depth differences.
3. Capture at least 10 checkerboard views with the camera settings used for sampling. Use different checkerboard positions and tilts. Supply internal corner counts and the measured square size:

```powershell
.venv/Scripts/python calibrate.py --images 'data/calibration/*.png' --columns 9 --rows 6 --square-mm 20 --marker-mm 20 --setup-id tray-1 --version tray-1-v1 --output artifacts/calibration.json
.venv/Scripts/python calibrate.py --marker artifacts/reference-marker.png
```

4. Print marker ID 0 from the `DICT_4X4_50` dictionary. Measure the **black square**, excluding the white border, and make its physical side match `markerMm`. Preserve the white border. Keep the shrimp at least one marker width away from it. Confirm calibration using independent objects of known length at several tray positions. The calibration tool rejects checkerboard reprojection RMS above one pixel; that alone does not prove accurate shrimp measurements.
5. In Vision & Growth choose a tank, create a session with batch identity, stocking date and calibration JSON, then enter specimen ID and actual capture time. Captures must be within 24 hours of the session timestamp. Start a new session for each sampling visit. Use the same batch ID and stocking date throughout a grow-out batch.
6. Reuse the specimen ID for repeat photographs of the same animal. The ID is unique within a tank and stocking batch. If the animal cannot be identified on another visit, do not claim individual longitudinal tracking.
7. Define body length as the centerline from **rostrum tip to telson tip**, excluding antennae. Review both endpoints and the curved path. The segmentation algorithm is a geometric candidate and does not recognize shrimp anatomy. Use the redraw control when it includes appendages or misses an endpoint. `examples/annotation.svg` shows the annotation convention, not a biological reference image.
8. Independently measure ruler length in mm and scale weight in g. Record instrument ID, resolution, verification date and sampling protocol in the collection log. Use an instrument precise enough for the size range. Enter readings without copying the prediction. A second observer should independently label a subset to quantify disagreement.
9. Approve acceptable measurements. Rejected images remain available for labeling and rejection-rate evaluation; recapture them for growth measurements. Corrected paths preserve the original result and have no inferred weight until a separate correction-aware model is validated.
10. Changing camera placement, resolution, focus, tray depth or lighting invalidates the setup. Click **Setup changed**, recalibrate and create a new session/profile version. Historical measurements remain identifiable by their original calibration. Operator confirmation is required because the software cannot detect every physical setup change.

Collect 300 distinct measured specimens across at least 10 sessions and available size ranges before the initial training experiment. This is a minimum collection target, not a statistical guarantee. Retain difficult and rejected images in the manifest to avoid hiding failures.

## Dataset and training

Export the tank dataset from the review panel. JSON contains specimen/session/tank/batch identifiers, timestamps, calibration versions, independent labels, original features and corrections. Image URLs require a signed-in session. For durable raw-image archiving, back up the private image directory together with the database; JSON export is not an image backup. Combine exports from several tanks by passing multiple filenames:

```powershell
.venv/Scripts/python train.py data/tank-a.json data/tank-b.json --output artifacts/experiment-001
```

The script requires 300 distinct labeled specimens. It uses chronological whole-session 60/20/20 partitions, purges earlier appearances of specimens assigned to later partitions, and keeps the latest photograph per specimen per session. At least 20 usable records must remain in each partition. It compares random-forest regression with a fitted power law; within 1% validation MAE it selects the power law. Only that choice is evaluated on the final test set. Do not tune against final-test results; collect a new final-test cohort for a changed experiment.

Outputs are `evaluation.json` and `weight.joblib`, with a dataset fingerprint, split image IDs, model version, validation scores, test MAE, bias, relative error, size groups, corrected-length results, rejection rate and p95 analysis latency. The model enables only if test length relative error is at most 5%, weight error at most 15%, and recorded p95 analysis time at most 10 seconds. These are provisional acceptance targets. No experiment output or enabled model is committed without real data.

The report distinguishes automatic and corrected lengths. Corrected weights are explicitly not evaluated. Growth averages use one latest approved image per specimen, not every photograph, and weight averages include only specimens with available estimates. They are sample averages, not population or biomass estimates.

To deploy a passing artifact, set `GROWTH_WEIGHT_MODEL` to its absolute path in the Python service environment and restart the service. Never load a joblib file from an untrusted source. Inference refuses measurements outside the intersection of training and held-out feature ranges.

## Forecasting experiment

```powershell
.venv/Scripts/python forecast.py data/tank-a.json data/tank-b.json --output artifacts/forecast-001
```

Entry requires independently weighed approved samples from 12 distinct culture weeks in each of three tank/batch groups. Training pairs must be six to eight days apart. A fixed ridge regression uses current measured average weight, recent daily growth and culture age. It compares with persistence and seven-day linear-growth baselines on chronological validation and final-test periods, purging targets that cross split boundaries.

Enable only when ridge MAE is lower than both baselines on both periods. If it fails, the experiment still produces a report and disabled artifact. For a passing artifact, set `GROWTH_FORECAST_MODEL` in the Python process and `GROWTH_FORECAST_ENABLED=true` in the backend, then restart both. The dashboard shows a separate forecast date, model version and held-out MAE. Live forecasts require two independently weighed weekly sessions and stay within the validated feature range. Estimated image weights are not silently substituted for measured forecasting inputs.

## API and operations

All operations use `/api/growth` through existing sign-in and same-origin mutation checks:

| Method | Input | Result |
| --- | --- | --- |
| GET | `tankId`, optional `batch` | Sessions, measurements, unique-specimen summaries, optional forecast |
| GET | `image=<measurementId>`, optional `raw=1` | Owner-only rectified PNG or original bytes |
| POST | `action=session`, tank/batch/dates/calibration | Immutable calibration snapshot and session |
| POST | `action=upload`, session/specimen/capture time/setup confirmation/base64 image | Analysis awaiting review, or rejected image with reason |
| POST | `action=invalidate`, session ID | Blocks further uploads under that session |
| PATCH | measurement ID, status, optional corrected path, independent labels | Reviewed measurement; original analysis unchanged |
| DELETE | `id=<measurementId>` | Removes private image files and measurement |
| DELETE | `sessionId=<sessionId>` | Removes an empty, owned sampling session |

Supported inputs are JPEG/PNG, at most 8 MB and 4096 pixels per side. Analysis requests time out after 11 seconds; the frontend gateway's existing 15-second limit remains. Storage has a configured byte cap and an exclusive filesystem write lock. Storage and model failures do not create invented measurements or change feeding controls. Timeout requests can be retried; image hashes deduplicate identical uploads within a session.

Back up the database and image directory together. After a process crash, stop all backend instances before inspecting/removing a stale `.write-lock` directory. A crash between image write and database commit may leave orphan files; count those against the cap and reconcile them with `GrowthMeasurement.imageKey` before deleting them. There is no automatic retention deletion. Keep storage on one local PC, not shared across independent hosts.

Tank deletion is restricted while sampling sessions exist, so growth evidence cannot be silently orphaned. Existing `VisionScan` data is retained as legacy data and does not enter the new growth history. No biological accuracy, long-term reliability, population, biomass, feed efficiency or harvest claims can be made from synthetic tests.

## Acceptance checks

Run `bun run test:growth`, backend and frontend typechecks/builds, and the Python unittest command. After building the frontend, `bun run test:growth-ui` runs a browser workflow against an isolated in-memory API. Install Playwright Chromium first, or set `GROWTH_TEST_BROWSER=msedge` to use installed Edge. This test does not substitute for a migrated database trial. Then use a disposable migrated database for this operator walkthrough:

1. Sign in, create a calibrated session and upload a real capture. Verify outline/path alignment on its rectified preview.
2. Save independent labels, correct the path and approve. Reload, and verify original plus corrected values persist.
3. Upload the identical file twice and multiple different photos of the same specimen. Verify one image record for the duplicate and one specimen in the average.
4. Switch tank/batch and sign in as another account. Confirm no cross-account sessions, images, exports or mutation access.
5. Stop inference, fill the configured storage quota, submit invalid images and invalidate calibration. Confirm explicit failures and no fabricated estimates.
6. Benchmark at least 30 accepted captures on the actual PC while telemetry is running. Record upload-to-review p50/p95, CPU, memory and failed/rejected counts separately from inference latency.
7. Run a real held-out evaluation and review `evaluation.json` before installing any model. Keep weight and forecasting unavailable when validation fails.

References: [OpenCV calibration](https://docs.opencv.org/4.12.0/d9/d0c/group__calib3d.html), [scikit-learn grouped and temporal evaluation](https://scikit-learn.org/stable/modules/cross_validation.html).
