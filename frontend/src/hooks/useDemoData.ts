"use client";

import { useEffect, useState } from "react";
import type { DemoData } from "@/types/api";

const empty: DemoData = {
  heroReadouts: [],
  feedSchedule: [],
  tankFormDefaults: {},
};
export function useDemoData() {
  const [data, setData] = useState<DemoData>(empty);
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/demo", { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error("Demo unavailable");
        return res.json();
      })
      .then(setData)
      .catch(() => {});
    return () => controller.abort();
  }, []);
  return data;
}
