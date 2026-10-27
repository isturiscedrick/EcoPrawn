"use client";

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { createEsp32Parser } from "../lib/esp32-serial";

export interface HardwareReading {
  id: string;
  tankId: string;
  temperature: number | null;
  distanceCm: number | null;
  waterLevel: number | null;
  recordedAt: string;
}
interface SerialSession {
  reader: ReadableStreamDefaultReader<Uint8Array> | null;
  stopped: boolean;
  abort: AbortController;
}
interface Esp32ConnectionValue {
  supported: boolean | null;
  status: "disconnected" | "connecting" | "connected";
  tankId: string | null;
  reading: HardwareReading | null;
  saved: number;
  error: string | null;
  connect: (tankId: string, emptyDistance: string, fullDistance: string) => Promise<void>;
  disconnect: () => void;
}
const Esp32Context = createContext<Esp32ConnectionValue | null>(null);

// The layout owns the reader so dashboard page changes do not close USB.
export function Esp32Provider({ children }: { children: ReactNode }) {
  const [supported, setSupported] = useState<boolean | null>(null);
  const [status, setStatus] = useState<Esp32ConnectionValue["status"]>("disconnected");
  const [tankId, setTankId] = useState<string | null>(null);
  const [reading, setReading] = useState<HardwareReading | null>(null);
  const [saved, setSaved] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const session = useRef<SerialSession | null>(null);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    setSupported(Boolean(navigator.serial && window.isSecureContext));
    return () => {
      mounted.current = false;
      if (session.current) {
        session.current.stopped = true;
        session.current.abort.abort();
        void session.current.reader?.cancel().catch(() => {});
      }
    };
  }, []);

  function disconnect() {
    const current = session.current;
    if (!current) return;
    current.stopped = true;
    current.abort.abort();
    void current.reader?.cancel().catch(() => {});
  }

  async function connect(tankId: string, emptyDistance: string, fullDistance: string) {
    if (!navigator.serial || session.current) return;
    const calibrated = emptyDistance !== "" || fullDistance !== "";
    if (calibrated && (emptyDistance === "" || fullDistance === "" ||
      !Number.isFinite(Number(emptyDistance)) || !Number.isFinite(Number(fullDistance)) ||
      Number(fullDistance) < 2 || Number(emptyDistance) > 400 || Number(emptyDistance) <= Number(fullDistance))) {
      setError("Enter both distances from 2 to 400 cm. Empty distance must be greater than full distance.");
      return;
    }
    const current: SerialSession = { reader: null, stopped: false, abort: new AbortController() };
    session.current = current;
    setError(null);
    setSaved(0);
    setTankId(tankId);
    setReading(null);
    setStatus("connecting");
    let port: EcoPrawnSerialPort | null = null;
    try {
      // Must run directly from the button gesture so the browser can show its port chooser.
      port = await navigator.serial.requestPort();
      if (current.stopped) return;
      await port.open({ baudRate: 115200 });
      if (current.stopped) return;
      if (!port.readable) throw new Error("The serial port has no readable stream");
      current.reader = port.readable.getReader();
      if (mounted.current) setStatus("connected");
      const decoder = new TextDecoder();
      const parse = createEsp32Parser();
      let buffer = "";
      while (!current.stopped) {
        const { value, done } = await current.reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        if (buffer.length > 16384) { buffer = ""; continue; }
        let end: number;
        while ((end = buffer.indexOf("\n")) !== -1 && !current.stopped) {
          const sample = parse(buffer.slice(0, end));
          buffer = buffer.slice(end + 1);
          if (!sample) continue;
          if (sample.temperature === null && sample.distanceCm === null) {
            if (mounted.current) setError("Both sensors returned errors. Check the DS18B20 on GPIO 25 and the ultrasonic wiring.");
            continue;
          }
          try {
            const response = await fetch("/api/hardware", {
              method: "POST", headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ tankId, ...sample, ...(calibrated ? {
                emptyDistanceCm: Number(emptyDistance), fullDistanceCm: Number(fullDistance),
              } : {}) }),
              signal: current.abort.signal,
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.error || "Unable to save this reading. Check that you are signed in.");
            if (mounted.current) {
              setReading(result.reading);
              window.dispatchEvent(new Event("ecoprawn:hardware-saved"));
              setSaved(count => count + 1);
              setError(sample.temperature === null ? "Temperature sensor disconnected; distance saved." :
                sample.distanceCm === null ? "Ultrasonic echo missing or outside 2 to 400 cm; temperature saved." : null);
            }
          } catch (cause) {
            if (!current.stopped && mounted.current) setError(cause instanceof Error ? cause.message : "Unable to save reading");
          }
        }
      }
    } catch (cause) {
      if (!current.stopped && mounted.current) {
        setError(cause instanceof DOMException && cause.name === "NotFoundError" ? "No port selected." :
          "Cannot open the ESP32. Close Arduino Serial Monitor, then select its USB serial port again.");
      }
    } finally {
      current.reader?.releaseLock();
      await port?.close().catch(() => {});
      if (session.current === current) session.current = null;
      if (mounted.current) setStatus("disconnected");
    }
  }

  return <Esp32Context.Provider value={{ supported, status, tankId, reading, saved, error, connect, disconnect }}>{children}</Esp32Context.Provider>;
}

export function useEsp32() {
  const connection = useContext(Esp32Context);
  if (!connection) throw new Error("useEsp32 requires Esp32Provider");
  return connection;
}
