import { describe, expect, test } from "bun:test";
import {
  convertToTimeUnit,
  formatTimeUnitValue,
  formatTimeUnitValueCompact,
  TIME_UNIT_LABELS,
  TIME_UNIT_SUFFIXES,
} from "./time-units";

describe("TIME_UNIT_LABELS", () => {
  test("has all expected labels", () => {
    expect(TIME_UNIT_LABELS.daily).toBe("일급");
    expect(TIME_UNIT_LABELS.hourly).toBe("시급");
    expect(TIME_UNIT_LABELS.minute).toBe("분급");
    expect(TIME_UNIT_LABELS.second).toBe("초급");
  });
});

describe("TIME_UNIT_SUFFIXES", () => {
  test("has all expected suffixes", () => {
    expect(TIME_UNIT_SUFFIXES.daily).toBe("d");
    expect(TIME_UNIT_SUFFIXES.hourly).toBe("h");
    expect(TIME_UNIT_SUFFIXES.minute).toBe("m");
    expect(TIME_UNIT_SUFFIXES.second).toBe("s");
  });
});

describe("convertToTimeUnit", () => {
  const hourlyRate = 30000; // 30,000원/hour (Korean context)

  test("converts to daily (8 hours)", () => {
    expect(convertToTimeUnit(hourlyRate, "daily")).toBe(240000);
  });

  test("returns hourly as-is", () => {
    expect(convertToTimeUnit(hourlyRate, "hourly")).toBe(30000);
  });

  test("converts to per-minute", () => {
    expect(convertToTimeUnit(hourlyRate, "minute")).toBe(500);
  });

  test("converts to per-second", () => {
    expect(convertToTimeUnit(hourlyRate, "second")).toBeCloseTo(8.333, 2);
  });

  test("handles fractional hourly rates", () => {
    expect(convertToTimeUnit(45.5, "daily")).toBe(364);
    expect(convertToTimeUnit(45.5, "minute")).toBeCloseTo(0.758, 2);
  });
});

describe("formatTimeUnitValue", () => {
  test("formats daily as rounded currency", () => {
    expect(formatTimeUnitValue(240000, "daily")).toBe("240,000원");
  });

  test("formats hourly as rounded currency", () => {
    expect(formatTimeUnitValue(30000, "hourly")).toBe("30,000원");
  });

  test("formats minute with suffix", () => {
    expect(formatTimeUnitValue(500, "minute")).toBe("500원/m");
  });

  test("formats second with suffix", () => {
    expect(formatTimeUnitValue(8, "second")).toBe("8원/s");
  });

  test("handles small values", () => {
    expect(formatTimeUnitValue(0.5, "second")).toBe("1원/s");
  });
});

describe("formatTimeUnitValueCompact", () => {
  test("formats daily compactly with suffix", () => {
    expect(formatTimeUnitValueCompact(240000, "daily")).toBe("24만/d");
  });

  test("formats hourly compactly with suffix", () => {
    expect(formatTimeUnitValueCompact(30000, "hourly")).toBe("3만/h");
  });

  test("formats large daily values with 억 suffix", () => {
    expect(formatTimeUnitValueCompact(150000000, "daily")).toBe("1.5억/d");
  });

  test("formats minute same as regular", () => {
    expect(formatTimeUnitValueCompact(500, "minute")).toBe("500원/m");
  });

  test("formats second same as regular", () => {
    expect(formatTimeUnitValueCompact(8, "second")).toBe("8원/s");
  });
});
