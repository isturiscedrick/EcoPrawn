# Evaluation status

No locally captured shrimp dataset, independent local instrument measurements or target-PC capture benchmark has been supplied. There is no deployable trained weight or forecasting model in this repository.

On 2026-11-08, thirty real research photographs from the openly licensed Mendeley V2 dataset were downloaded through its public Hugging Face mirror and tested through the local HTTP inference service. All thirty decoded, but all were rejected for missing camera calibration. None had the required ArUco marker; six passed the separate dark-tray lighting precondition. No length or weight estimates were generated. This tests external-input compatibility and safe rejection, not segmentation or biological accuracy. See [the public-image test report](reports/public-image-test.md), exact source hashes in [the manifest](reports/public-image-manifest.json), and [per-image results](reports/public-image-results.json).

Synthetic tests exercise calibration rejection, tray segmentation, missing reference, empty image, multiple objects, clipping, blur, reflections, missing models, dataset separation and model activation. Passing these tests does not establish shrimp measurement accuracy.

Implementation verification completed on 2026-11-08:

- Ten Python tests pass, including authenticated loopback inference and forecasting baseline rejection.
- Growth API/storage tests, existing API-validation tests and account-isolation regressions pass.
- Both production builds and the backend typecheck pass.
- A headless Edge walkthrough with a local API fixture passes session creation, upload, independent labels, approval, correction, reload, tank switching and mobile overflow checks.
- The full frontend typecheck reports existing errors in `LogoIntroGate.tsx`, `PublicChromeMotion.tsx` and `HeroLens.tsx`. It reports no errors in the new growth files.

The hosted migration, real database persistence walkthrough and live-camera validation have not been performed. The browser test uses an in-memory API fixture; backend API tests use an isolated database substitute.

An experimental P3 model has now been trained and evaluated on real labeled external photographs. On 26 unseen DB1–DB4 specimens it achieved mean Dice 0.921, versus 0.682 for the segmentation baseline. On the 20 held-out DB5 images Dice dropped to 0.168, with 14 images yielding no usable body geometry. Exploratory weight MAE was 2.064 g on 25 undisputed DB1–DB4 test specimens; DB5 weight results cover only six of twenty images. These artifacts remain disabled for production. See the [full experimental report](reports/p3-segmentation-v1.md) for splits, coverage, limitations and reproducibility.

The first local-camera acceptance evaluation must come from `train.py` using local camera captures and independent labels. Preserve its dataset fingerprint, split IDs, calibration versions, trained artifact and report together. Do not replace failed results with fabricated values.

Required real-data evidence:

- Length MAE in mm, bias and relative error, split by size and automatic/corrected method.
- Weight MAE in g, bias and relative error against weighed shrimp, with missing estimates reported.
- Rejection rate including unsuccessful captures, not just approved images.
- Capture-to-review p95 on the actual PC with telemetry active, separate from inference duration.
- A separate chronological forecast report after the weekly-data gate is met.
