import { describe, it, expect } from "vitest";
import {
  formatNumberWithCommas,
  isDataUrl,
  formatDate,
  formatTotalInWords,
} from "@/lib/helpers";

// ─── formatNumberWithCommas ──────────────────────────────────────────────────

describe("formatNumberWithCommas", () => {
  it("formats a number with US locale (comma thousands, dot decimal)", () => {
    // Intl output – use the actual locale output to avoid hard-coded locale strings
    expect(formatNumberWithCommas(1234.56, "en-US")).toBe(
      (1234.56).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    );
  });

  it("always shows two decimal places", () => {
    const result = formatNumberWithCommas(100, "en-US");
    expect(result.endsWith(".00") || result.endsWith(",00")).toBe(true);
  });

  it("formats zero as '0.00' (en-US)", () => {
    expect(formatNumberWithCommas(0, "en-US")).toBe("0.00");
  });

  it("formats large numbers with thousands separator", () => {
    const result = formatNumberWithCommas(1000000, "en-US");
    // en-US uses comma as thousands separator
    expect(result).toContain(",");
  });

  it("uses Brazilian locale separators for pt-BR", () => {
    const result = formatNumberWithCommas(1234.56, "pt-BR");
    expect(result).toBe(
      (1234.56).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    );
  });
});

// ─── isDataUrl ────────────────────────────────────────────────────────────────

describe("isDataUrl", () => {
  it("returns true for a valid data URL", () => {
    expect(isDataUrl("data:image/png;base64,abc123")).toBe(true);
  });

  it("returns true for a data URL with any media type", () => {
    expect(isDataUrl("data:image/jpeg;base64,xyz")).toBe(true);
    expect(isDataUrl("data:application/json;,{}")).toBe(true);
  });

  it("returns false for a regular https URL", () => {
    expect(isDataUrl("https://example.com/image.png")).toBe(false);
  });

  it("returns false for an empty string", () => {
    expect(isDataUrl("")).toBe(false);
  });

  it("returns false for a plain file path", () => {
    expect(isDataUrl("/images/logo.png")).toBe(false);
  });
});

// ─── formatDate ──────────────────────────────────────────────────────────────

describe("formatDate", () => {
  it("formats a valid ISO date string using the specified locale", () => {
    // "2026-03-01" interpreted as UTC midnight; toLocaleDateString uses local TZ
    // Use the same call to avoid locale-specific hardcoding
    const d = new Date("2026-03-01");
    const expected = d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    expect(formatDate("2026-03-01", "en-US")).toBe(expected);
  });

  it("returns the original string when the date is invalid", () => {
    expect(formatDate("not-a-date", "en-US")).toBe("not-a-date");
  });

  it("returns the original string for an empty string", () => {
    expect(formatDate("", "en-US")).toBe("");
  });
});

// ─── formatTotalInWords ───────────────────────────────────────────────────────

describe("formatTotalInWords", () => {
  it("formats a whole-number amount in English", () => {
    expect(formatTotalInWords(1000, "USD", "en")).toBe("One thousand USD");
  });

  it("includes cents in English when there is a fractional part", () => {
    expect(formatTotalInWords(1000.5, "USD", "en")).toBe(
      "One thousand USD and fifty cents"
    );
  });

  it("formats zero as 'Zero {currency}'", () => {
    expect(formatTotalInWords(0, "USD", "en")).toBe("Zero USD");
  });

  it("formats a whole-number amount in Portuguese (Brazil)", () => {
    const result = formatTotalInWords(1, "BRL", "pt-BR");
    expect(result).toBe("Um BRL");
  });

  it("includes centavos in Portuguese when there is a fractional part", () => {
    const result = formatTotalInWords(1.5, "BRL", "pt-BR");
    expect(result).toBe("Um BRL e cinquenta centavos");
  });

  it("capitalises the first letter of the words portion", () => {
    const result = formatTotalInWords(5, "EUR", "en");
    expect(result[0]).toBe(result[0]!.toUpperCase());
  });

  it("defaults to English when language is undefined", () => {
    const result = formatTotalInWords(2, "GBP", undefined);
    expect(result).toMatch(/two GBP/i);
  });
});
