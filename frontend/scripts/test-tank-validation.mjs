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

test("rejects blank, malformed, scientific notation, nonfinite and fractional population", () => {
  for (const [field, value] of [
    ["name", "   "], ["pl", " "], ["biomass", ""], ["biomass", "1kg"],
    ["biomass", "Infinity"], ["biomass", "0x10"], ["biomass", "1e5"], ["biomass", "1.12345"],
    ["population", "1.2"], ["population", "12abc"], ["population", "1e6"],
  ]) {
    const result = validateNewTank({ ...valid, [field]: value }, defaults);
    assert.ok(result.error, `${field}=${JSON.stringify(value)} should fail`);
    assert.ok(result.fieldErrors?.[field], `${field}=${JSON.stringify(value)} should set fieldErrors.${field}`);
  }
});

test("enforces realistic aquaculture ranges and text lengths", () => {
  for (const [field, value] of [
    ["name", "x".repeat(101)], ["pl", "x".repeat(101)],
    ["biomass", "-0.1"], ["biomass", "10000.1"], ["biomass", "999999999"],
    ["dissolvedOxygen", "-0.1"], ["dissolvedOxygen", "20.1"],
    ["ph", "-0.1"], ["ph", "14.1"],
    ["temperature", "-0.1"], ["temperature", "50.1"],
    ["salinity", "-0.1"], ["salinity", "50.1"],
    ["waterLevel", "-1"], ["waterLevel", "100.1"],
    ["population", "-1"], ["population", "1000001"], ["population", "999999999"],
  ]) {
    const result = validateNewTank({ ...valid, [field]: value }, defaults);
    assert.ok(result.error, `${field}=${JSON.stringify(value)} should fail`);
    assert.ok(result.fieldErrors?.[field], `${field}=${JSON.stringify(value)} should set fieldErrors.${field}`);
  }
  assert.ok(
    validateNewTank(
      {
        ...valid,
        biomass: "10000",
        dissolvedOxygen: "20",
        ph: "14",
        temperature: "50",
        salinity: "50",
        waterLevel: "100",
        population: "1000000",
      },
      defaults,
    ).value,
  );
});
