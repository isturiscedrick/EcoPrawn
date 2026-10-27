"use client";

import { useEffect, useState } from "react";
import { Panel } from "./DashboardPrimitives";
import { useEsp32, type HardwareReading } from "../context/Esp32Context";

export function Esp32Connection({ tankId, tankName }: { tankId: string; tankName: string }) {
  const usb = useEsp32();
  const { supported, status, disconnect } = usb;
  const [reading, setReading] = useState<HardwareReading | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [emptyDistance, setEmptyDistance] = useState("");
  const [fullDistance, setFullDistance] = useState("");
  const saved = usb.tankId === tankId ? usb.saved : 0;
  const error = (usb.tankId === tankId ? usb.error : null) ?? loadError;
  const connect = () => usb.connect(tankId, emptyDistance, fullDistance);

  useEffect(() => {
    if (usb.reading?.tankId === tankId) setReading(usb.reading);
  }, [usb.reading, tankId]);

  useEffect(() => {
    const abort = new AbortController();
    let timer: ReturnType<typeof setTimeout>;
    async function load() {
      try {
        const response = await fetch(`/api/hardware?tankId=${encodeURIComponent(tankId)}`, { cache: "no-store", signal: abort.signal });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "Unable to load hardware readings");
        setLoadError(null);
        if (result.readings[0]) {
          const latest: HardwareReading = result.readings[0];
          setReading(current => !current || latest.recordedAt > current.recordedAt ? latest : current);
        }
      } catch (cause) {
        if (!abort.signal.aborted) setLoadError(cause instanceof Error ? cause.message : "Unable to load hardware readings");
      } finally {
        if (!abort.signal.aborted) timer = setTimeout(load, 5000);
      }
    }
    void load();
    return () => { abort.abort(); clearTimeout(timer); };
  }, [tankId]);

  return (
    <Panel title={`ESP32 measurements · ${tankName}`} badge={status === "connected" ? usb.tankId === tankId ? "USB connected" : "USB active on another tank" : "USB test"}>
      <p className="text-sm text-[rgba(11,35,32,0.65)] mb-4">
        Close Arduino Serial Monitor, connect the USB cable, then select the ESP32 port. Keep this browser tab open to save readings. USB stays connected when you open Overview.
      </p>
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <button type="button" onClick={status === "connected" ? disconnect : () => void connect()}
          disabled={supported !== true || status === "connecting"}
          className="rounded-lg bg-[var(--mangrove)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--mangrove)]">
          {status === "connected" ? "Disconnect ESP32" : status === "connecting" ? "Connecting…" : "Connect ESP32"}
        </button>
        <span role="status" className="text-xs text-[rgba(11,35,32,0.65)]">{saved > 0 ? `${saved} reading${saved === 1 ? "" : "s"} saved this session` : status === "connected" ? "Waiting for a sensor reading…" : "115200 baud"}</span>
      </div>
      {supported === false ? <p className="text-sm text-[var(--amber-text)] mb-4">Open this page in Chrome, Edge or another browser with Web Serial, using localhost or HTTPS.</p> : null}
      {error ? <p role="alert" className="text-sm text-[var(--amber-text)] mb-4">{error}</p> : null}
      <dl className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
        <div><dt className="text-xs text-[rgba(11,35,32,0.6)]">DS18B20 temperature</dt><dd className="ep-font-mono text-xl mt-1">{reading?.temperature != null ? `${reading.temperature.toFixed(2)} °C` : "No reading"}</dd></div>
        <div><dt className="text-xs text-[rgba(11,35,32,0.6)]">HC-SR04 distance to water</dt><dd className="ep-font-mono text-xl mt-1">{reading?.distanceCm != null ? `${reading.distanceCm.toFixed(2)} cm` : "No reading"}</dd></div>
        <div><dt className="text-xs text-[rgba(11,35,32,0.6)]">Calibrated water level</dt><dd className="ep-font-mono text-xl mt-1">{reading?.waterLevel != null ? `${reading.waterLevel.toFixed(1)}%` : "Not calibrated"}</dd></div>
      </dl>
      <p className="text-xs text-[rgba(11,35,32,0.6)] mb-4">{reading ? `Last saved ${new Date(reading.recordedAt).toLocaleString()}. ` : "No hardware measurements saved yet. "}Oxygen, pH and salinity require additional sensors. These USB test readings do not send SMS alerts.</p>
      <details>
        <summary className="cursor-pointer text-sm font-semibold text-[var(--mangrove)]">Water level calibration, optional</summary>
        <p className="text-xs text-[rgba(11,35,32,0.65)] my-3">Measure from the sensor to the water surface at empty and full levels. Set both before connecting, or leave both blank to record distance only.</p>
        <div className="flex flex-wrap gap-4">
          <label className="text-sm">Distance at empty (cm)<input type="number" min="2" max="400" step="0.1" value={emptyDistance} onChange={event => setEmptyDistance(event.target.value)} disabled={status !== "disconnected"} className="block mt-1 w-40 rounded-lg border border-[var(--sand-dim)] px-3 py-2" /></label>
          <label className="text-sm">Distance at full (cm)<input type="number" min="2" max="400" step="0.1" value={fullDistance} onChange={event => setFullDistance(event.target.value)} disabled={status !== "disconnected"} className="block mt-1 w-40 rounded-lg border border-[var(--sand-dim)] px-3 py-2" /></label>
        </div>
      </details>
    </Panel>
  );
}
