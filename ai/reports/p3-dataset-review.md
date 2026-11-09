# P3 dataset review

Inspected on 2026-11-08. Source folder: `C:/Users/perey/Downloads/P3_DATASET_RELEASE_v1_3/P3_DATASET_RELEASE`.

## Verdict

This is a usable starting dataset for shrimp body segmentation and exploratory weight estimation. It contains the human-drawn masks missing from the thirty-image smoke test. It does not supply independent camera calibration, a local-camera validation set, or longitudinal growth observations. No model was trained, no production gate was relaxed, and the supplied files were not modified.

The local README identifies internal release 1.3 of the Mendeley anatomical subset, DOI `10.17632/n244f3kyd3.1`, derived from `10.17632/h8tcn6ykky.1`. Its stated license is CC BY 4.0, with attribution to both releases required. The README explains that masks have already been registered to the images; `offsets.csv` records transformations already applied. Do not apply these offsets a second time.

## Verified contents

| Check | Observed result |
| --- | --- |
| Main release checksum list | 782 / 782 match; no missing files |
| Distinct shrimp and original photographs | 148; no duplicate specimen identities or image hashes |
| DB1 / DB2 / DB3 / DB4 / DB5 | 18 / 48 / 42 / 20 / 20 specimens |
| Original masks | 592, four per specimen |
| Additional corrected organ masks | 36 |
| Mask dimensions and format | All 628 checked masks match their image dimensions; single-channel, nonempty, values only 0 and 255 |
| Image resolution | All 148 images are 640 × 480 RGB |
| Length and weight labels | Present and positive for all 148; length 7.25–14.4 cm, weight 6–41 g |
| Cephalothorax labels | Missing for the 18 DB1 specimens, as documented |
| Separate labels.csv and organs_auditoria.csv | Byte-identical to the release copies |
| Organ-audit and fold identities | Match all 148 label identities |

File integrity verifies consistency with the supplied checksum list. It does not independently verify biological measurements or every mask's anatomical correctness. One original image/full-body mask pair was also visually inspected; a complete visual annotation review remains useful before training.

## Issues to handle

1. **Derived scale is not camera calibration.** The README states that `px_por_cm_base` was fitted using full-body mask Feret diameter and manual length labels within each database. Using those all-data factors to measure held-out length would leak information from test labels. For an experiment that needs a fitted scale, estimate it only from each training partition. For absolute measurement validation, collect independent calibration from the real camera. Do not use the CSV factors as EcoPrawn calibration JSON.
2. **Seventeen disputed specimens.** `etiqueta_en_disputa=True` marks DB3_s33 through DB3_s49. The release follows the parent labels, but the README says original field sheets were unavailable to settle the dispute. Use the other 131 specimens for the primary biometric experiment and report a separate sensitivity analysis including all 148. Disputed biometrics do not automatically invalidate their body masks for segmentation.
3. **Organ locations need the audit file.** There are 96 position-correct originals, 35 translation corrections, one rotation-plus-translation correction, and 16 unresolved specimens. Use corrected organ masks where available and exclude unresolved organ locations from spatial training. The full-body masks are not subject to this specific organ-position problem. Growth work can start with `mask_full` without using organ masks.
4. **Crosswalk hash inconsistency.** All 148 image hashes in `crosswalk_p3.csv` match current images, but all 592 mask hashes in that crosswalk differ from current masks. All of those masks pass `checksums.sha256`. Use the main checksum file to verify the current release, and the crosswalk for identity/name mapping; do not treat the crosswalk mask hashes as current-file checksums. This is an internal metadata inconsistency, not evidence that the download is corrupt.
5. **Specimen IDs require the crosswalk.** DB1's internal `id_trabajo_p3` numbering differs from the parent sample numbers. Use `(base, muestra_mendeley)` as parent identity. Keep every image of a given parent specimen in the same data partition if combining this subset with the larger parent dataset.
6. **Length definitions need reconciliation.** The release distinguishes manual vernier length from full-body mask Feret diameter; they are not interchangeable with EcoPrawn's curved rostrum-to-telson centerline. Confirm endpoints and measuring protocol before comparing errors.
7. **Small, selected dataset.** The release selected complete, extended, approximately overhead specimens. Its supplied random folds support reference reproduction but do not by themselves test transfer to a new camera or capture setting. Use a group-held-out evaluation in addition to specimen-level splits, and reserve local-camera captures for final validation. This release alone cannot satisfy EcoPrawn's 300-local-specimen training gate or its weekly forecasting-data gate.
8. **Two full-body masks reach the image edge.** DB1_s18 maps to `DB1/M1_s21_frame01.png`; DB3_s9 maps to `DB3/M3_s09_frame40.png`. Visual inspection of their masks confirms that a body endpoint meets the lower or upper image boundary. Flag these for original-image review before using them in a full-length benchmark; do not assume every selected specimen has margin around both endpoints.

## Recommended use in EcoPrawn

Start with RGB images paired with `mask_full`, where 255 is shrimp and 0 is background. EcoPrawn's `centerline` helper already expects white foreground, so do not invert masks for that helper; inversion in the dataset README refers to the separate P3 pipeline. Train and evaluate segmentation against these manual masks using Dice/IoU and per-database results. Do not report a model evaluated directly on human masks as automatic image segmentation.

Keep public experimental records separate from operator sampling sessions. After segmentation works, run a separate weight-regression experiment with training-only preprocessing and disputed-label sensitivity analysis. Preserve calibration and model-activation requirements in the application. The dataset contains one selected observation per specimen, not repeated dated growth measurements, so it cannot validate seven-day forecasting.

## Reproduce the audit

From the repository root:

```powershell
ai/.venv/Scripts/python ai/audit_p3_dataset.py 'C:/Users/perey/Downloads/P3_DATASET_RELEASE_v1_3' --standalone 'C:/Users/perey/Downloads/labels.csv' 'C:/Users/perey/Downloads/organs_auditoria.csv'
```

Detailed machine-readable results are in `p3-dataset-audit.json`. Downloaded source files remain in Downloads and are not copied into the repository.
