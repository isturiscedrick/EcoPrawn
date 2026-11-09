"""Experimental public-dataset pixel classifier. Independent of calibrated production inference."""
import cv2
import numpy as np

FEATURE_VERSION = "color-local-contrast-v1"
SIZE = (320, 240)


def features(image):
    """Deterministic image-only features; no labels, filenames, scale or database identity."""
    image = cv2.resize(image, SIZE, interpolation=cv2.INTER_AREA)
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY).astype(np.float32) / 255
    channels = [image.astype(np.float32) / 255,
                cv2.cvtColor(image, cv2.COLOR_BGR2LAB).astype(np.float32) / 255,
                cv2.cvtColor(image, cv2.COLOR_BGR2HSV).astype(np.float32) / 255,
                gray[:, :, None]]
    for sigma in (1, 3, 7, 15):
        mean = cv2.GaussianBlur(gray, (0, 0), sigma)
        variance = np.maximum(0, cv2.GaussianBlur(gray * gray, (0, 0), sigma) - mean * mean)
        channels.extend([mean[:, :, None], (gray - mean)[:, :, None], np.sqrt(variance)[:, :, None]])
    for dx, dy in [(1, 0), (0, 1)]:
        channels.append(cv2.Sobel(gray, cv2.CV_32F, dx, dy)[:, :, None])
    return np.concatenate(channels, axis=2).reshape(-1, 24)


def cleanup(mask):
    mask = np.uint8(mask) * 255
    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (3, 3))
    mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, kernel)
    mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, kernel)
    count, labels, stats, _ = cv2.connectedComponentsWithStats(mask)
    if count <= 1:
        return np.zeros_like(mask)
    component = 1 + np.argmax(stats[1:, cv2.CC_STAT_AREA])
    mask = np.uint8(labels == component) * 255
    contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    cv2.drawContours(mask, contours, -1, 255, -1)
    return mask


def probability(model, image):
    return model.predict_proba(features(image))[:, 1].reshape(SIZE[1], SIZE[0])


def mask_from_probability(prob, threshold, original_size):
    small = cleanup(prob >= threshold)
    return cv2.resize(small, original_size, interpolation=cv2.INTER_NEAREST)


def baseline(image, threshold):
    small = cv2.resize(image, SIZE, interpolation=cv2.INTER_AREA)
    gray = cv2.cvtColor(small, cv2.COLOR_BGR2GRAY).astype(np.float32) / 255
    contrast = cv2.GaussianBlur(gray, (0, 0), 10) - gray
    return cv2.resize(cleanup(contrast > threshold), (image.shape[1], image.shape[0]), interpolation=cv2.INTER_NEAREST)


def overlap(predicted, actual):
    p, a = predicted > 0, actual > 0
    intersection = int((p & a).sum())
    total, union = int(p.sum() + a.sum()), int((p | a).sum())
    return {"dice": 2 * intersection / total if total else 1.0,
            "iou": intersection / union if union else 1.0}


def geometry(mask):
    contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    if not contours:
        return None
    contour = max(contours, key=cv2.contourArea)
    area = cv2.contourArea(contour)
    sides = sorted(cv2.minAreaRect(contour)[1])
    if area <= 0 or sides[0] <= 0:
        return None
    return [float(area), float(cv2.arcLength(contour, True)), float(sides[1]), float(sides[0])]
