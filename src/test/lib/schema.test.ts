import { describe, it, expect, vi } from "vitest";
import { validateInvoice, translateValidationErrors } from "@/lib/schema";
import { VALID_INVOICE } from "../fixtures";

// ─── validateInvoice ─────────────────────────────────────────────────────────

describe("validateInvoice", () => {
  it("returns success for a fully valid invoice", () => {
    const result = validateInvoice(VALID_INVOICE);
    expect(result.success).toBe(true);
    expect(result.errors).toBeUndefined();
  });

  it("fails when sender name is empty", () => {
    const invoice = {
      ...VALID_INVOICE,
      sender: { ...VALID_INVOICE.sender, name: "" },
    };
    const result = validateInvoice(invoice);
    expect(result.success).toBe(false);
    expect(result.errors?.some((e) => e.includes("sender.name"))).toBe(true);
  });

  it("fails when receiver name is empty", () => {
    const invoice = {
      ...VALID_INVOICE,
      receiver: { ...VALID_INVOICE.receiver, name: "" },
    };
    const result = validateInvoice(invoice);
    expect(result.success).toBe(false);
    expect(result.errors?.some((e) => e.includes("receiver.name"))).toBe(true);
  });

  it("fails when invoiceNumber is empty", () => {
    const invoice = {
      ...VALID_INVOICE,
      details: { ...VALID_INVOICE.details, invoiceNumber: "" },
    };
    const result = validateInvoice(invoice);
    expect(result.success).toBe(false);
    expect(
      result.errors?.some((e) => e.includes("details.invoiceNumber"))
    ).toBe(true);
  });

  it("fails when paymentTerms is empty", () => {
    const invoice = {
      ...VALID_INVOICE,
      details: { ...VALID_INVOICE.details, paymentTerms: "" },
    };
    const result = validateInvoice(invoice);
    expect(result.success).toBe(false);
    expect(
      result.errors?.some((e) => e.includes("details.paymentTerms"))
    ).toBe(true);
  });

  it("fails when items array is empty", () => {
    const invoice = {
      ...VALID_INVOICE,
      details: { ...VALID_INVOICE.details, items: [] },
    };
    const result = validateInvoice(invoice);
    expect(result.success).toBe(false);
    expect(
      result.errors?.some((e) => e.includes("validation.atLeastOneItem"))
    ).toBe(true);
  });

  it("fails when all items have quantity 0", () => {
    const invoice = {
      ...VALID_INVOICE,
      details: {
        ...VALID_INVOICE.details,
        items: [
          { ...VALID_INVOICE.details.items[0]!, quantity: 0 },
        ],
      },
    };
    const result = validateInvoice(invoice);
    expect(result.success).toBe(false);
    expect(
      result.errors?.some((e) =>
        e.includes("validation.atLeastOneItemWithQuantity")
      )
    ).toBe(true);
  });

  it("fails when sender email is not a valid email address", () => {
    const invoice = {
      ...VALID_INVOICE,
      sender: { ...VALID_INVOICE.sender, email: "not-an-email" },
    };
    const result = validateInvoice(invoice);
    expect(result.success).toBe(false);
    expect(
      result.errors?.some((e) => e.includes("sender.email"))
    ).toBe(true);
  });

  it("accepts an empty email string (email is optional)", () => {
    const invoice = {
      ...VALID_INVOICE,
      sender: { ...VALID_INVOICE.sender, email: "" },
    };
    const result = validateInvoice(invoice);
    expect(result.success).toBe(true);
  });

  it("returns errors array when validation fails", () => {
    const result = validateInvoice({ bad: "data" });
    expect(result.success).toBe(false);
    expect(Array.isArray(result.errors)).toBe(true);
    expect(result.errors!.length).toBeGreaterThan(0);
  });
});

// ─── translateValidationErrors ───────────────────────────────────────────────

describe("translateValidationErrors", () => {
  it("translates known validation keys through the t function", () => {
    const t = vi.fn((key: string) =>
      key === "validation.required" ? "This field is required" : key
    );
    const errors = ["details.invoiceNumber: validation.required"];
    const result = translateValidationErrors(errors, t);
    expect(result).toContain("This field is required");
    expect(t).toHaveBeenCalledWith("validation.required");
  });

  it("joins multiple errors with newlines", () => {
    const t = vi.fn((key: string) => key);
    const errors = ["sender.name: validation.required", "receiver.name: validation.required"];
    const result = translateValidationErrors(errors, t);
    const lines = result.split("\n");
    expect(lines).toHaveLength(2);
  });

  it("passes through errors whose message is not a translation key", () => {
    const t = vi.fn((key: string) => key);
    const errors = ["form: Custom plain-text error"];
    const result = translateValidationErrors(errors, t);
    expect(result).toBe("form: Custom plain-text error");
  });

  it("handles error strings without a colon separator", () => {
    const t = vi.fn((key: string) =>
      key === "validation.atLeastOneItem" ? "At least one item" : key
    );
    const errors = ["validation.atLeastOneItem"];
    const result = translateValidationErrors(errors, t);
    expect(result).toBe("At least one item");
  });
});
