# Evaluation status

No real shrimp dataset, independent instrument measurements or target-PC capture benchmark has been supplied. There is no deployable trained weight or forecasting model in this repository.

Synthetic tests exercise calibration rejection, tray segmentation, missing reference, empty image, multiple objects, clipping, blur, reflections, missing models, dataset separation and model activation. Passing these tests does not establish shrimp measurement accuracy.

Implementation verification completed on 2026-11-08:

- Ten Python tests pass, including authenticated loopback inference and forecasting baseline rejection.
- Growth API/storage tests, existing API-validation tests and account-isolation regressions pass.
- Both production builds and the backend typecheck pass.
- A headless Edge walkthrough with a local API fixture passes session creation, upload, independent labels, approval, correction, reload, tank switching and mobile overflow checks.
- The full frontend typecheck reports existing errors in `LogoIntroGate.tsx`, `PublicChromeMotion.tsx` and `HeroLens.tsx`. It reports no errors in the new growth files.

The hosted migration, real database persistence walkthrough and live-camera validation have not been performed. The browser test uses an in-memory API fixture; backend API tests use an isolated database substitute.

The first actual evaluation report must come from `train.py` using local camera captures and independent labels. Preserve its dataset fingerprint, split IDs, calibration versions, trained artifact and report together. Do not replace failed results with fabricated values.

Required real-data evidence:

- Length MAE in mm, bias and relative error, split by size and automatic/corrected method.
- Weight MAE in g, bias and relative error against weighed shrimp, with missing estimates reported.
- Rejection rate including unsuccessful captures, not just approved images.
- Capture-to-review p95 on the actual PC with telemetry active, separate from inference duration.
- A separate chronological forecast report after the weekly-data gate is met.
