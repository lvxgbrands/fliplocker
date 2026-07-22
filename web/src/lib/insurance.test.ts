import { describe, it, expect, afterEach } from "vitest";
import { simulatedInsuranceCents, insuranceMode } from "./insurance";

describe("simulatedInsuranceCents", () => {
  it("is zero for a non-positive value or rate", () => {
    expect(simulatedInsuranceCents(0, 50)).toBe(0);
    expect(simulatedInsuranceCents(-100, 50)).toBe(0);
    expect(simulatedInsuranceCents(10000, 0)).toBe(0);
  });

  it("charges the configured rate per started $100 of declared value", () => {
    expect(simulatedInsuranceCents(10000, 50)).toBe(50); // exactly $100 -> 1 unit
    expect(simulatedInsuranceCents(10001, 50)).toBe(100); // just over $100 -> 2 units
    expect(simulatedInsuranceCents(25000, 50)).toBe(150); // $250 -> 3 units
    expect(simulatedInsuranceCents(1, 50)).toBe(50); // any positive value rounds up to 1 unit
  });
});

describe("insuranceMode", () => {
  afterEach(() => {
    delete process.env.INSURANCE_MODE;
  });

  it("defaults to simulator", () => {
    delete process.env.INSURANCE_MODE;
    expect(insuranceMode()).toBe("simulator");
  });

  it("selects cabrella only when explicitly set", () => {
    process.env.INSURANCE_MODE = "cabrella";
    expect(insuranceMode()).toBe("cabrella");
    process.env.INSURANCE_MODE = "CABRELLA";
    expect(insuranceMode()).toBe("cabrella");
    process.env.INSURANCE_MODE = "something-else";
    expect(insuranceMode()).toBe("simulator");
  });
});
