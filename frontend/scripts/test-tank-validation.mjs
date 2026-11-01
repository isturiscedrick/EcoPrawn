import assert from "node:assert/strict";
import test from "node:test";
import { validateNewTank } from "../src/features/dashboard/validateNewTank.ts";

const valid = {
  name: "  Tank A  ", pl: "  PL-1  ", biomass: "10",
  dissolvedOxygen: "6", ph: "7.8", temperature: "28",
  salinity: "15", waterLevel: "95", population: "1000",
};
const defaults = { bodyLength: 0, weight: 0, fcr: 0 };

test("trims text and preserves valid zero readings", () => {
  const result = validateNewTank({ ...valid, biomass: "0", population: "0", waterLevel: "0" }, defaults);
  assert.ok(result.value);
  assert.equal(result.value.name, "Tank A");
  assert.equal(result.value.pl, "PL-1");
  assert.equal(result.value.biomass, 0);
  assert.equal(result.value.population, 0);
  assert.equal(result.value.targetToday, 0);
});

test("rejects blank, malformed, nonfinite and fractional population", () => {
  for (const [field, value] of [
    ["name", "   "], ["pl", " "], ["biomass", ""], ["biomass", "1kg"],
    ["biomass", "Infinity"], ["biomass", "0x10"], ["population", "1.2"], ["population", "12abc"],
  ]) {
    const result = validateNewTank({ ...valid, [field]: value }, defaults);
    assert.ok(result.error, `${field}=${JSON.stringify(value)} should fail`);
  }
});

test("enforces backend ranges and text lengths", () => {
  for (const [field, value] of [
    ["name", "x".repeat(101)], ["pl", "x".repeat(101)],
    ["biomass", "-0.1"], ["dissolvedOxygen", "100.1"],
    ["ph", "14.1"], ["temperature", "-55.1"],
    ["salinity", "1000.1"], ["waterLevel", "100.1"],
    ["population", "2147483648"],
  ]) {
    const result = validateNewTank({ ...valid, [field]: value }, defaults);
    assert.ok(result.error, `${field}=${JSON.stringify(value)} should fail`);
  }
  assert.ok(validateNewTank({ ...valid, dissolvedOxygen: "100", ph: "14", temperature: "-55", salinity: "1000", waterLevel: "100", population: "2147483647" }, defaults).value);
});
