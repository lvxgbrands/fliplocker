import { describe, it, expect } from "vitest";
import { ALLOWED_TRANSITIONS, newShortCode, newInviteToken, cardTitle, STATUS_LABELS } from "./deals";
import type { DealStatus } from "@prisma/client";

describe("deal state machine", () => {
  it("defines transitions for every status", () => {
    const statuses = Object.keys(STATUS_LABELS) as DealStatus[];
    for (const s of statuses) {
      expect(ALLOWED_TRANSITIONS[s]).toBeDefined();
    }
  });

  it("follows the happy path CREATED → COMPLETE", () => {
    const path: DealStatus[] = [
      "CREATED", "BUYER_NOTIFIED", "ACCEPTED", "PAID", "AWAITING_SELLER_SHIPMENT",
      "IN_TRANSIT_TO_HUB", "RECEIVED_AT_HUB", "VERIFIED", "REPACKED",
      "IN_TRANSIT_TO_BUYER", "DELIVERED_SIGNED", "FUNDS_RELEASED", "COMPLETE",
    ];
    for (let i = 0; i < path.length - 1; i++) {
      expect(ALLOWED_TRANSITIONS[path[i]]).toContain(path[i + 1]);
    }
  });

  it("does not allow skipping payment", () => {
    expect(ALLOWED_TRANSITIONS.BUYER_NOTIFIED).not.toContain("PAID");
    expect(ALLOWED_TRANSITIONS.ACCEPTED).not.toContain("IN_TRANSIT_TO_HUB");
  });

  it("treats terminal states as terminal", () => {
    expect(ALLOWED_TRANSITIONS.COMPLETE).toEqual([]);
    expect(ALLOWED_TRANSITIONS.DECLINED).toEqual([]);
    expect(ALLOWED_TRANSITIONS.CANCELLED).toEqual([]);
    expect(ALLOWED_TRANSITIONS.REFUNDED).toEqual([]);
  });

  it("allows a paid deal to be refunded but not a mere invitation", () => {
    expect(ALLOWED_TRANSITIONS.PAID).toContain("REFUNDED");
    expect(ALLOWED_TRANSITIONS.BUYER_NOTIFIED).not.toContain("REFUNDED");
  });

  it("routes failed documentation to FLAGGED then REFUNDED", () => {
    expect(ALLOWED_TRANSITIONS.RECEIVED_AT_HUB).toContain("FLAGGED");
    expect(ALLOWED_TRANSITIONS.FLAGGED).toContain("REFUNDED");
  });

  it("never lands on a status without an entry (no dangling targets)", () => {
    for (const targets of Object.values(ALLOWED_TRANSITIONS)) {
      for (const t of targets) {
        expect(ALLOWED_TRANSITIONS[t]).toBeDefined();
      }
    }
  });
});

describe("code + token generation", () => {
  it("short codes look like FL-XXXXXX with an unambiguous alphabet", () => {
    for (let i = 0; i < 200; i++) {
      const code = newShortCode();
      expect(code).toMatch(/^FL-[23456789ABCDEFGHJKMNPQRSTUVWXYZ]{6}$/);
    }
  });

  it("invite tokens are long and unique", () => {
    const seen = new Set<string>();
    for (let i = 0; i < 500; i++) {
      const t = newInviteToken();
      expect(t.length).toBeGreaterThanOrEqual(40);
      expect(seen.has(t)).toBe(false);
      seen.add(t);
    }
  });
});

describe("cardTitle", () => {
  it("composes a readable title", () => {
    const title = cardTitle({ cardYear: 2018, playerName: "Luka Dončić", sport: "Basketball", gradingCompany: "PSA", certNumber: "82345678" });
    expect(title).toBe("2018 Luka Dončić (Basketball) — PSA #82345678");
  });
});
