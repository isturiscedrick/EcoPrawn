/**
 * Presentation helpers for the illustrative water-quality preview on the
 * public landing page. Thresholds remain sourced from the shared sensor
 * configuration so the preview stays aligned with dashboard guidance.
 */
import { waterQualityThresholds } from "@/content/landing-preview";

const ZONES: Record<
  string,
  { min: number; max: number; lo: number; hi: number }
> = {
  "Dissolved O₂": { min: 0, max: 8, lo: 4.5, hi: 8 },
  pH: { min: 6, max: 10, lo: 7.5, hi: 8.5 },
  Temperature: { min: 20, max: 36, lo: 26, hi: 30 },
  Salinity: { min: 0, max: 30, lo: 10, hi: 20 },
  "Water Level": { min: 0, max: 100, lo: 90, hi: 100 },
};

const pct = (v: number, min: number, max: number) =>
  Math.max(0, Math.min(100, ((v - min) / (max - min)) * 100));

function targetRangeFor(label: string): string | undefined {
  return waterQualityThresholds.find((t) => t.label === label)?.range;
}
