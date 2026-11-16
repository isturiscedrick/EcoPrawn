import { useEffect, useState } from "react";
import { getThresholds, type ThresholdSettings } from "@/features/dashboard/lib/thresholds";

export function useThresholdSettings() {
  const [thresholdSettings, setThresholdSettings] = useState<ThresholdSettings>(getThresholds);

  useEffect(() => {
    const syncThresholds = () => setThresholdSettings(getThresholds());
    window.addEventListener("ecoprawn:thresholds-updated", syncThresholds);
    window.addEventListener("storage", syncThresholds);

    return () => {
      window.removeEventListener("ecoprawn:thresholds-updated", syncThresholds);
      window.removeEventListener("storage", syncThresholds);
    };
  }, []);

  return [thresholdSettings, setThresholdSettings] as const;
}
