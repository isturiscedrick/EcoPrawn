# P3 segmentation and exploratory weight experiment

Run on 2026-11-08. Experimental artifacts remain disabled for production.

## Dataset and evaluation

Used the 148 labeled photographs in the user-supplied P3 release, attributed to Ramírez-Coronel et al., [Mendeley DOI 10.17632/n244f3kyd3.1](https://data.mendeley.com/datasets/n244f3kyd3/1), CC BY 4.0. Original downloads were not modified. See [dataset audit](p3-dataset-review.md).

Fixed seed 20261108 assigns 76 specimens to training, 26 to validation and 26 to testing from DB1–DB4. All 20 DB5 specimens are a separate held-out capture-group test. No specimen crosses partitions. These dataset groups are not a substitute for documented local capture sessions or chronological evaluation.

The CPU ExtraTrees pixel classifier uses 24 color and local-contrast features at 320×240 resolution, with 64 trees and 121,600 balanced training pixels. Validation selected foreground threshold 0.65. A local dark-contrast baseline selected threshold 0.03. Both use the same morphological cleanup and largest-component rule. Test results did not change training or threshold selection.

## Segmentation results

| Evaluation set | Images | Model mean Dice | Baseline mean Dice | Model mean IoU |
| --- | ---: | ---: | ---: | ---: |
| Validation, DB1–DB4 | 26 | 0.921 | 0.733 | 0.856 |
| Unseen specimens, DB1–DB4 | 26 | 0.921 | 0.682 | 0.856 |
| Entirely held-out DB5 | 20 | 0.168 | 0.169 | 0.137 |

Dice measures overlap with human masks; it is not physical length accuracy. Fourteen of the 20 DB5 images produced no usable body geometry. This is a substantial failure to transfer to another capture group. The preview shows the lowest, middle and highest overlap in each test set, including failures, with green predicted outlines and pink reference outlines.

DB5 p95 inference latency was approximately 84 ms on this PC. This excludes upload, operator review and the calibrated production pipeline; it does not establish the application's ten-second acceptance target.

## Exploratory weight results

Weight models use only predicted pixel area, perimeter and bounding-box dimensions. Neither manual length, label-derived `px_por_cm_base`, nor dataset-group identity is a predictor. Seventeen disputed biometric labels are excluded from primary weight fitting and evaluation. Training uses 65 undisputed specimens; validation uses 21.

Validation chose an ExtraTrees regressor over an area–weight power law. The power law is an exploratory pixel-area baseline, not the planned calibrated length–weight baseline. A constant training-median predictor is also reported in the machine-readable evaluation.

| Evaluation set | Estimates / eligible | Selected model MAE | Mean relative error | Power-law MAE |
| --- | ---: | ---: | ---: | ---: |
| Unseen DB1–DB4, undisputed | 25 / 25 | 2.064 g | 8.68% | 2.899 g |
| Held-out DB5 | 6 / 20 | 1.479 g | 19.17% | See JSON |

The DB5 weight error describes only six images with usable geometry. Fourteen failures are excluded from that error, so it must not be presented as performance across all twenty specimens. Pixel geometry depends on camera scale. Weight training features come from in-sample segmentation predictions; test features come from unseen specimens. These results do not validate weight estimation with a different camera or physical length measurement.

## Artifacts and reproduction

- [Versioned evaluation](p3-segmentation-v1-evaluation.json) and [fixed split manifest](p3-segmentation-v1-split.json).
- Local ignored artifacts: `ai/artifacts/p3-segmentation-v1/segmentation.joblib`, `experimental-weight.joblib`, predictions, masks, selection record and `preview.html`.
- A standalone inference check loaded the saved segmentation artifact and wrote a mask. It returned unavailable length and weight, with production disabled.

From `ai/`, with the pinned requirements installed:

```powershell
.venv/Scripts/python train_p3_experiment.py 'C:/Users/perey/Downloads/P3_DATASET_RELEASE_v1_3' --output artifacts/p3-reproduction
.venv/Scripts/python predict_segmentation.py 'path/to/shrimp.png' --model artifacts/p3-segmentation-v1/segmentation.joblib --output artifacts/my-segmentation-check
.venv/Scripts/python -m unittest test_segmentation test_growth
```

Output folders must be new. Only load trusted joblib artifacts. Reproduction on this fixed split is not a new independent evaluation. Any improvement informed by these failures needs a fresh held-out dataset to support a new generalization claim.

## Decision

Keep this model experimental and outside the production measurement service. Continue developing upload/review workflows without a camera. Later, collect consistent local captures with a metric reference and independently measured length and weight, then evaluate against new held-out sessions. No calibrated length, camera-transfer, whole-tank biomass or growth-forecasting claim is supported by this experiment.
