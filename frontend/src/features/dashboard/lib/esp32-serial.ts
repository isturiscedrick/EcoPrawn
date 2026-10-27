export interface Esp32Sample {
  temperature: number | null;
  distanceCm: number | null;
}

// Accept the original human-readable sketch and newline-delimited JSON.
export function createEsp32Parser() {
  let frame: Esp32Sample = { temperature: null, distanceCm: null };
  let seen = false;
  const reset = () => { frame = { temperature: null, distanceCm: null }; seen = false; };
  const inRange = (value: unknown, min: number, max: number): number | null =>
    typeof value === "number" && Number.isFinite(value) && value >= min && value <= max ? value : null;
  return (input: string): Esp32Sample | null => {
    const line = input.trim();
    if (line.startsWith("{")) {
      reset();
      try {
        const value = JSON.parse(line);
        if (!value || typeof value !== "object" || Array.isArray(value) ||
            !("temperature" in value || "distanceCm" in value)) return null;
        return { temperature: inRange(value.temperature, -55, 125), distanceCm: inRange(value.distanceCm, 2, 400) };
      } catch { return null; }
    }
    if (line === "--- EcoPrawn Telemetry ---") { reset(); return null; }
    if (/^-{5,}$/.test(line)) {
      const result = seen ? { ...frame } : null;
      reset();
      return result;
    }
    const temp = /^Water Temperature:\s*(-?\d+(?:\.\d+)?)\s/.exec(line);
    const distance = /^Water Level Distance:\s*(\d+(?:\.\d+)?)\s*cm/.exec(line);
    if (temp) { frame.temperature = inRange(Number(temp[1]), -55, 125); seen = true; }
    if (distance) { frame.distanceCm = inRange(Number(distance[1]), 2, 400); seen = true; }
    if (/^Temperature: ERROR/.test(line)) { frame.temperature = null; seen = true; }
    if (/^Water Level: ERROR/.test(line)) { frame.distanceCm = null; seen = true; }
    return null;
  };
}
