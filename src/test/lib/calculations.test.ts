import { describe, it, expect } from "vitest";
import {
  computeItemTotal,
  computeSubTotal,
  computeTotalAmount,
  getInvoiceWithComputedTotals,
} from "@/lib/calculations";
import { VALID_INVOICE } from "../fixtures";
import type { Invoice } from "@/types/invoice";

// ─── helpers ────────────────────────────────────────────────────────────────

function invoiceWith(overrides: Partial<Invoice["details"]>): Invoice {
  return {
    ...VALID_INVOICE,
    details: { ...VALID_INVOICE.details, ...overrides },
  };
}

// ─── computeItemTotal ────────────────────────────────────────────────────────

describe("computeItemTotal", () => {
  it("returns quantity × unit price", () => {
    expect(computeItemTotal(3, 25)).toBe(75);
  });

  it("returns 0 when quantity is 0", () => {
    expect(computeItemTotal(0, 100)).toBe(0);
  });

  it("returns 0 when unit price is 0", () => {
    expect(computeItemTotal(5, 0)).toBe(0);
  });

  it("rounds floating-point results to 2 decimal places", () => {
    // 0.1 × 0.2 has JS floating-point noise — must be rounded to 0.02
    expect(computeItemTotal(0.1, 0.2)).toBe(0.02);
    // 3 × 1.12 = 3.36 exactly (no floating-point surprise)
    expect(computeItemTotal(3, 1.12)).toBe(3.36);
  });
});

// ─── computeSubTotal ─────────────────────────────────────────────────────────

describe("computeSubTotal", () => {
  it("returns 0 for an empty items array", () => {
    expect(computeSubTotal([])).toBe(0);
  });

  it("sums all item totals", () => {
    const items = [
      { id: "a", name: "A", description: "", quantity: 2, unitPrice: 50, total: 0 },
      { id: "b", name: "B", description: "", quantity: 3, unitPrice: 100, total: 0 },
    ];
    // 2×50 + 3×100 = 100 + 300 = 400
    expect(computeSubTotal(items)).toBe(400);
  });

  it("handles a single-item array", () => {
    const items = [{ id: "x", name: "X", description: "", quantity: 10, unitPrice: 100, total: 0 }];
    expect(computeSubTotal(items)).toBe(1000);
  });
});

// ─── computeTotalAmount ──────────────────────────────────────────────────────

describe("computeTotalAmount", () => {
  it("equals the subtotal when no adjustments are enabled", () => {
    const invoice = invoiceWith({ discountEnabled: false, taxEnabled: false, shippingEnabled: false });
    expect(computeTotalAmount(invoice)).toBe(1000);
  });

  it("subtracts a percentage discount", () => {
    const invoice = invoiceWith({
      discountEnabled: true,
      discountDetails: { amount: 10, amountType: "percentage" }, // 10% of 1000 = 100
    });
    expect(computeTotalAmount(invoice)).toBe(900);
  });

  it("subtracts a fixed-amount discount", () => {
    const invoice = invoiceWith({
      discountEnabled: true,
      discountDetails: { amount: 150, amountType: "amount" },
    });
    expect(computeTotalAmount(invoice)).toBe(850);
  });

  it("adds a fixed tax", () => {
    const invoice = invoiceWith({
      taxEnabled: true,
      taxDetails: { amount: 200, amountType: "amount" },
    });
    expect(computeTotalAmount(invoice)).toBe(1200);
  });

  it("adds percentage shipping applied to the post-discount/tax amount", () => {
    const invoice = invoiceWith({
      shippingEnabled: true,
      shippingDetails: { cost: 10, costType: "percentage" }, // 10% of 1000 = 100
    });
    expect(computeTotalAmount(invoice)).toBe(1100);
  });

  it("applies discount → tax → shipping in sequence", () => {
    const invoice = invoiceWith({
      discountEnabled: true,
      discountDetails: { amount: 10, amountType: "percentage" }, // 1000 - 100 = 900
      taxEnabled: true,
      taxDetails: { amount: 10, amountType: "percentage" }, // 900 + 90 = 990
      shippingEnabled: true,
      shippingDetails: { cost: 10, costType: "percentage" }, // 990 + 99 = 1089
    });
    expect(computeTotalAmount(invoice)).toBe(1089);
  });

  it("ignores disabled adjustments even when values are set", () => {
    const invoice = invoiceWith({
      discountEnabled: false,
      discountDetails: { amount: 9999, amountType: "percentage" },
      taxEnabled: false,
      taxDetails: { amount: 9999, amountType: "amount" },
    });
    expect(computeTotalAmount(invoice)).toBe(1000);
  });

  it("ignores adjustments with zero value", () => {
    const invoice = invoiceWith({
      discountEnabled: true,
      discountDetails: { amount: 0, amountType: "percentage" },
    });
    expect(computeTotalAmount(invoice)).toBe(1000);
  });
});

// ─── getInvoiceWithComputedTotals ────────────────────────────────────────────

describe("getInvoiceWithComputedTotals", () => {
  it("updates each line item's total field", () => {
    const invoice = invoiceWith({
      items: [{ id: "i", name: "X", description: "", quantity: 4, unitPrice: 25, total: 0 }],
    });
    const result = getInvoiceWithComputedTotals(invoice);
    expect(result.details.items[0]!.total).toBe(100);
  });

  it("sets subTotal correctly", () => {
    const result = getInvoiceWithComputedTotals(VALID_INVOICE);
    expect(result.details.subTotal).toBe(1000);
  });

  it("sets totalAmount applying enabled adjustments", () => {
    const invoice = invoiceWith({
      discountEnabled: true,
      discountDetails: { amount: 100, amountType: "amount" },
    });
    const result = getInvoiceWithComputedTotals(invoice);
    expect(result.details.totalAmount).toBe(900);
  });

  it("populates totalAmountInWords when includeTotalInWords is true", () => {
    const result = getInvoiceWithComputedTotals(VALID_INVOICE);
    expect(result.details.totalAmountInWords).not.toBe("");
    expect(result.details.totalAmountInWords).toMatch(/one thousand/i);
  });

  it("leaves totalAmountInWords empty when includeTotalInWords is false", () => {
    const invoice = invoiceWith({ includeTotalInWords: false });
    const result = getInvoiceWithComputedTotals(invoice);
    expect(result.details.totalAmountInWords).toBe("");
  });

  it("does not mutate the original invoice", () => {
    const original = structuredClone(VALID_INVOICE);
    getInvoiceWithComputedTotals(VALID_INVOICE);
    expect(VALID_INVOICE.details.subTotal).toBe(original.details.subTotal);
  });
});
