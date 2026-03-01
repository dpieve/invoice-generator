import { describe, it, expect } from "vitest";
import { parseInvoiceFromObject } from "@/lib/parseInvoiceJson";
import { VALID_INVOICE } from "../fixtures";

// A minimal raw object that satisfies the parser's field requirements
const MINIMAL_RAW = {
  sender: { name: "Alice" },
  receiver: { name: "Bob" },
  details: {
    invoiceNumber: "1",
    currency: "USD",
    items: [{ id: "i1", name: "Thing", quantity: 1, unitPrice: 50 }],
  },
};

describe("parseInvoiceFromObject", () => {
  // ─── guard clauses ──────────────────────────────────────────────────────

  it("throws \"Invalid JSON\" for null", () => {
    expect(() => parseInvoiceFromObject(null)).toThrowError("Invalid JSON");
  });

  it("throws \"Invalid JSON\" for a primitive string", () => {
    expect(() => parseInvoiceFromObject("hello")).toThrowError("Invalid JSON");
  });

  it("throws \"Invalid JSON\" for a number", () => {
    expect(() => parseInvoiceFromObject(42)).toThrowError("Invalid JSON");
  });

  it("throws \"Missing required fields\" for an array (arrays are objects in JS)", () => {
    // typeof [] === 'object', so it passes the first guard and fails the field check
    expect(() => parseInvoiceFromObject([])).toThrowError("Missing required fields");
  });

  it("throws \"Missing required fields\" when sender is absent", () => {
    expect(() =>
      parseInvoiceFromObject({ receiver: {}, details: {} })
    ).toThrowError("Missing required fields");
  });

  it("throws \"Missing required fields\" when receiver is absent", () => {
    expect(() =>
      parseInvoiceFromObject({ sender: {}, details: {} })
    ).toThrowError("Missing required fields");
  });

  it("throws \"Missing required fields\" when details is absent", () => {
    expect(() =>
      parseInvoiceFromObject({ sender: {}, receiver: {} })
    ).toThrowError("Missing required fields");
  });

  // ─── happy path ─────────────────────────────────────────────────────────

  it("returns a typed Invoice for a minimal valid object", () => {
    const result = parseInvoiceFromObject(MINIMAL_RAW);
    expect(result.sender.name).toBe("Alice");
    expect(result.receiver.name).toBe("Bob");
    expect(result.details.currency).toBe("USD");
    expect(result.details.items).toHaveLength(1);
  });

  it("coerces numeric strings in items to numbers", () => {
    const raw = {
      ...MINIMAL_RAW,
      details: {
        ...MINIMAL_RAW.details,
        items: [{ id: "i1", name: "X", quantity: "3", unitPrice: "99" }],
      },
    };
    const result = parseInvoiceFromObject(raw);
    expect(typeof result.details.items[0]!.quantity).toBe("number");
    expect(result.details.items[0]!.quantity).toBe(3);
  });

  it("inserts a blank item when items array is empty", () => {
    const raw = {
      ...MINIMAL_RAW,
      details: { ...MINIMAL_RAW.details, items: [] },
    };
    const result = parseInvoiceFromObject(raw);
    expect(result.details.items).toHaveLength(1);
    expect(result.details.items[0]!.name).toBe("");
  });

  it("defaults missing optional fields to safe values", () => {
    const result = parseInvoiceFromObject(MINIMAL_RAW);
    expect(result.language).toBe("en");
    expect(result.sender.customInputs).toEqual([]);
    expect(result.details.discountEnabled).toBe(false);
    expect(result.details.taxEnabled).toBe(false);
    expect(result.details.shippingEnabled).toBe(false);
    expect(result.details.includeTotalInWords).toBe(true);
  });

  it("preserves \"pt-BR\" language when provided", () => {
    const raw = { ...MINIMAL_RAW, language: "pt-BR" };
    const result = parseInvoiceFromObject(raw);
    expect(result.language).toBe("pt-BR");
  });

  it("falls back to \"en\" for unknown language strings", () => {
    const raw = { ...MINIMAL_RAW, language: "fr" };
    const result = parseInvoiceFromObject(raw);
    expect(result.language).toBe("en");
  });

  it("preserves customInputs arrays from sender/receiver", () => {
    const raw = {
      ...MINIMAL_RAW,
      sender: { name: "Alice", customInputs: [{ key: "VAT", value: "DE123" }] },
    };
    const result = parseInvoiceFromObject(raw);
    expect(result.sender.customInputs).toEqual([{ key: "VAT", value: "DE123" }]);
  });

  it("round-trips a full VALID_INVOICE through JSON serialisation", () => {
    const json = JSON.parse(JSON.stringify(VALID_INVOICE));
    const result = parseInvoiceFromObject(json);
    expect(result.sender.name).toBe(VALID_INVOICE.sender.name);
    expect(result.receiver.name).toBe(VALID_INVOICE.receiver.name);
    expect(result.details.invoiceNumber).toBe(VALID_INVOICE.details.invoiceNumber);
    expect(result.details.items).toHaveLength(VALID_INVOICE.details.items.length);
  });
});
