# Public shrimp image test

Source: [https://data.mendeley.com/datasets/h8tcn6ykky/2](https://data.mendeley.com/datasets/h8tcn6ykky/2). CC BY 4.0; attribution and exact file hashes are in public-image-manifest.json.

Thirty original PNGs from thirty different specimens, six from each of DB1–DB5, were sent through the authenticated local HTTP inference service. No production model, database or calibration was changed.

| Check | Result |
| --- | --- |
| images | 30 |
| decoded | 30 |
| http200 | 30 |
| accepted | 0 |
| rejected | 30 |
| lengthOutputs | 0 |
| weightOutputs | 0 |
| imagesWithRequiredMarker | 0 |
| imagesMeetingDarkTrayPrecondition | 6 |
| reasons | {'Missing or invalid calibration': 30} |
| requestP95Ms | 42.523499999999984 |

## What this establishes

The service can decode the selected real research photographs and refuses to fabricate measurements without calibration. Marker detection and the dark-tray precondition were also checked independently on the unchanged images.

This is not a successful shrimp measurement or detection benchmark. The normal pipeline stops before segmentation because no camera calibration is available. Rejection latency is not measurement latency. Length MAE, weight MAE and detection accuracy cannot be calculated from this run.

The current algorithm expects a calibrated dark tray and a physical ArUco reference. These public images come from a different capture setup. Adding a drawn marker, guessing camera intrinsics, or deriving scale from the test length labels would invalidate a measurement test.

## Next useful experiment

Use the public dataset for a separately evaluated shrimp segmentation model, with specimens kept in separate dataset partitions. The 148-image anatomical-mask subset at https://data.mendeley.com/datasets/n244f3kyd3/1 is a promising source, but its download endpoint returned HTTP 403 in this environment; it was not downloaded or tested. Confirm its length convention before comparing it with EcoPrawn's rostrum-to-telson measurement.

For validating the existing application, collect calibrated photographs from the intended camera. Public weight/length labels do not sup ply that camera's calibration or establish performance on it.

## Reproduce

From ai/: `.venv/Scripts/python test_public_images.py --download`. To rerun cached images, omit `--download`. Raw images are kept in ignored `ai/data/external-shrimp/`; the manifest and reports are versionable.
