import unittest
import cv2
import numpy as np
from segmentation import features, cleanup, overlap, geometry, SIZE
from train_p3_experiment import split_dataset


class SegmentationTests(unittest.TestCase):
    def test_overlap_exact_disjoint_and_empty(self):
        left=np.zeros((40,40),np.uint8); left[5:15,5:15]=255
        right=np.zeros_like(left); right[20:30,20:30]=255
        self.assertEqual(overlap(left,left),{"dice":1.0,"iou":1.0})
        self.assertEqual(overlap(left,right),{"dice":0.0,"iou":0.0})
        self.assertEqual(overlap(np.zeros_like(left),left),{"dice":0.0,"iou":0.0})

    def test_specimen_split_and_domain_holdout(self):
        rows=[{"key":f"DB{g}:{i}","base":f"DB{g}","muestra_mendeley":str(i)} for g in range(1,6) for i in range(20)]
        splits=split_dataset(rows)
        self.assertEqual(splits,split_dataset(rows))
        keys=[{r["key"] for r in group} for group in splits.values()]
        self.assertEqual(len(set.union(*keys)),100)
        for i,a in enumerate(keys):
            for b in keys[:i]: self.assertFalse(a&b)
        self.assertTrue(all(r["base"]=="DB5" for r in splits["domain_test"]))
        self.assertTrue(all(r["base"]!="DB5" for name,group in splits.items() if name!="domain_test" for r in group))

    def test_image_only_features_and_empty_prediction(self):
        image=np.full((480,640,3),100,np.uint8)
        x=features(image)
        self.assertEqual(x.shape,(SIZE[0]*SIZE[1],24))
        self.assertTrue(np.isfinite(x).all())
        blank=cleanup(np.zeros((240,320),bool))
        self.assertEqual(np.count_nonzero(blank),0)
        self.assertIsNone(geometry(blank))

    def test_cleanup_keeps_largest_body_not_speckles(self):
        mask=np.zeros((100,100),bool)
        mask[20:50,20:70]=True; mask[80,80]=True
        cleaned=cleanup(mask)
        self.assertEqual(cleaned[80,80],0)
        self.assertGreater(np.count_nonzero(cleaned),1000)
        self.assertEqual(len(geometry(cleaned)),4)


if __name__=="__main__": unittest.main()
