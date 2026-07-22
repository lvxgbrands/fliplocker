import { describe, it, expect, afterEach } from "vitest";
import { shippingMode, labelToken, verifyLabelToken } from "./shipping";

describe("shippingMode", () => {
  afterEach(() => {
    delete process.env.SHIPPING_MODE;
  });

  it("defaults to simulator", () => {
    delete process.env.SHIPPING_MODE;
    expect(shippingMode()).toBe("simulator");
  });

  it("recognizes shippo and easypost, and falls back to simulator", () => {
    process.env.SHIPPING_MODE = "shippo";
    expect(shippingMode()).toBe("shippo");
    process.env.SHIPPING_MODE = "EasyPost";
    expect(shippingMode()).toBe("easypost");
    process.env.SHIPPING_MODE = "bogus";
    expect(shippingMode()).toBe("simulator");
  });
});

describe("label token", () => {
  it("round-trips and rejects tampering or a different shipment id", () => {
    const t = labelToken("ship_123");
    expect(verifyLabelToken("ship_123", t)).toBe(true);
    expect(verifyLabelToken("ship_123", t + "x")).toBe(false);
    expect(verifyLabelToken("ship_999", t)).toBe(false);
  });
});
