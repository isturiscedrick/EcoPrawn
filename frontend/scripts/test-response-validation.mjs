import assert from "node:assert/strict";
import { parseDashboardResponse, parseHardwareListResponse, parseHardwareReadingResponse } from "../src/features/dashboard/lib/validate-response.ts";

const reading = {
  id: "reading-1", tankId: "tank-1", temperature: null, distanceCm: 24,
  waterLevel: null, recordedAt: "2026-11-01T00:00:00.000Z",
};
const dashboard = {
  success: true,
  tankActivity: [],
  tanks: [{
    id: "tank-1", name: "North", pl: "PL-1", biomass: 1, fcr: 1,
    targetToday: 1, dispensedToday: 0, telemetries: [{
      dissolvedOxygen: 6, ph: 8, temperature: 28, salinity: 15, waterLevel: 95,
    }], visionScans: [{ bodyLength: 1, weight: 1, population: 100, abnormalCount: 0 }],
    hardwareTelemetries: [reading],
  }],
  waterTrend: [{ tankId: "tank-1", value: 6 }], growthTrend: [1],\n  waterHistory: [{ tankId: "tank-1", recordedAt: "2026-11-01T00:00:00.000Z", dissolvedOxygen: 6, ph: 8, temperature: 28, salinity: 15, waterLevel: 95 }],\n  growthHistory: [{ tankId: "tank-1", tankName: "North", recordedAt: "2026-11-01T00:00:00.000Z", bodyLength: 1, weight: 1, population: 100, abnormalCount: 0 }],\n  visionScanLog: [],
  feedSchedule: [{ id: "feed-1", time: "08:00", amount: "1 kg", status: "upcoming" }],
  bioflocMetrics: [], effluentLog: [], alertsLog: [], resolvedAlerts: 0,
};

assert.equal(parseDashboardResponse(dashboard).tanks[0].name, "North");
assert.equal(parseHardwareReadingResponse({ success: true, reading }, "tank-1").temperature, null);
assert.equal(parseHardwareListResponse({ success: true, readings: [reading] }, "tank-1").length, 1);

const invalidDashboard = (change) => {
  const copy = structuredClone(dashboard);
  change(copy);
  assert.throws(() => parseDashboardResponse(copy), /Invalid dashboard response/);
};
invalidDashboard(value => { value.tanks[0].telemetries[0].ph = 15; });
invalidDashboard(value => { value.tanks[0].telemetries[0].waterLevel = "95"; });
invalidDashboard(value => { value.tanks[0].visionScans[0].population = 1.5; });
invalidDashboard(value => { value.tanks[0].hardwareTelemetries[0].distanceCm = 500; });
invalidDashboard(value => { value.growthTrend = [Infinity]; });\ninvalidDashboard(value => { value.waterHistory[0].recordedAt = "not-a-date"; });\ninvalidDashboard(value => { value.growthHistory[0].population = -1; });
invalidDashboard(value => { value.feedSchedule[0].status = "broken"; });
invalidDashboard(value => { delete value.tanks; });

assert.throws(() => parseHardwareListResponse({ success: true, readings: {} }, "tank-1"), /Invalid hardware readings response/);
assert.throws(() => parseHardwareListResponse({ success: true, readings: [{ ...reading, tankId: "tank-2" }] }, "tank-1"), /Invalid hardware readings response/);
assert.throws(() => parseHardwareReadingResponse({ success: true, reading: { ...reading, temperature: "28" } }, "tank-1"), /Invalid hardware reading response/);
assert.throws(() => parseHardwareReadingResponse({ success: true, reading: { ...reading, waterLevel: 40, distanceCm: null } }, "tank-1"), /Invalid hardware reading response/);
assert.throws(() => parseHardwareReadingResponse({ success: true, reading: { ...reading, recordedAt: "bad date" } }, "tank-1"), /Invalid hardware reading response/);

console.log("Dashboard and hardware response validation passed");
