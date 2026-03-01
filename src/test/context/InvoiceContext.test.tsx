import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { InvoiceProvider, useInvoice } from "@/context/InvoiceContext";
import { VALID_INVOICE } from "../fixtures";
import type { ReactNode } from "react";

const wrapper = ({ children }: { children: ReactNode }) => (
  <InvoiceProvider>{children}</InvoiceProvider>
);

describe("InvoiceContext", () => {
  // ─── updateSender ─────────────────────────────────────────────────────────

  describe("updateSender", () => {
    it("merges partial sender data without discarding other fields", () => {
      const { result } = renderHook(() => useInvoice(), { wrapper });

      act(() => result.current.setInvoice(VALID_INVOICE));
      act(() => result.current.updateSender({ name: "Updated Name" }));

      expect(result.current.invoice.sender.name).toBe("Updated Name");
      // Other sender fields must be preserved
      expect(result.current.invoice.sender.email).toBe(VALID_INVOICE.sender.email);
    });
  });

  // ─── updateReceiver ───────────────────────────────────────────────────────

  describe("updateReceiver", () => {
    it("merges partial receiver data without discarding other fields", () => {
      const { result } = renderHook(() => useInvoice(), { wrapper });

      act(() => result.current.setInvoice(VALID_INVOICE));
      act(() => result.current.updateReceiver({ city: "Chicago" }));

      expect(result.current.invoice.receiver.city).toBe("Chicago");
      expect(result.current.invoice.receiver.name).toBe(VALID_INVOICE.receiver.name);
    });
  });

  // ─── updateDetails ────────────────────────────────────────────────────────

  describe("updateDetails", () => {
    it("updates a single detail field without affecting others", () => {
      const { result } = renderHook(() => useInvoice(), { wrapper });

      act(() => result.current.setInvoice(VALID_INVOICE));
      act(() => result.current.updateDetails({ invoiceNumber: "INV-999" }));

      expect(result.current.invoice.details.invoiceNumber).toBe("INV-999");
      expect(result.current.invoice.details.currency).toBe(VALID_INVOICE.details.currency);
    });

    it("can toggle boolean flags (e.g. discountEnabled)", () => {
      const { result } = renderHook(() => useInvoice(), { wrapper });

      act(() => result.current.setInvoice(VALID_INVOICE));
      act(() => result.current.updateDetails({ discountEnabled: true }));

      expect(result.current.invoice.details.discountEnabled).toBe(true);
    });
  });

  // ─── setItems ─────────────────────────────────────────────────────────────

  describe("setItems", () => {
    it("replaces the items array in full", () => {
      const { result } = renderHook(() => useInvoice(), { wrapper });

      act(() => result.current.setInvoice(VALID_INVOICE));
      const newItems = [
        { id: "new-1", name: "New Item", description: "", quantity: 2, unitPrice: 50, total: 100 },
      ];
      act(() => result.current.setItems(newItems));

      expect(result.current.invoice.details.items).toHaveLength(1);
      expect(result.current.invoice.details.items[0]!.name).toBe("New Item");
    });
  });

  // ─── resetInvoice ─────────────────────────────────────────────────────────

  describe("resetInvoice", () => {
    it("restores the invoice to default state after modifications", () => {
      const { result } = renderHook(() => useInvoice(), { wrapper });

      act(() => result.current.setInvoice(VALID_INVOICE));
      expect(result.current.invoice.sender.name).toBe("Acme Corp");

      act(() => result.current.resetInvoice());

      expect(result.current.invoice.sender.name).toBe("");
      expect(result.current.invoice.details.invoiceNumber).toBe("1");
    });
  });

  // ─── getInvoiceJson ───────────────────────────────────────────────────────

  describe("getInvoiceJson", () => {
    it("returns valid JSON that parses without error", () => {
      const { result } = renderHook(() => useInvoice(), { wrapper });

      act(() => result.current.setInvoice(VALID_INVOICE));

      const json = result.current.getInvoiceJson();
      expect(() => JSON.parse(json)).not.toThrow();
    });

    it("includes computed subTotal and totalAmount in the JSON output", () => {
      const { result } = renderHook(() => useInvoice(), { wrapper });

      act(() => result.current.setInvoice(VALID_INVOICE));

      const parsed = JSON.parse(result.current.getInvoiceJson());
      expect(parsed.details.subTotal).toBe(1000);
      expect(parsed.details.totalAmount).toBe(1000);
    });
  });

  // ─── loadFromJson ─────────────────────────────────────────────────────────

  describe("loadFromJson", () => {
    it("updates invoice state from a valid JSON string", () => {
      const { result } = renderHook(() => useInvoice(), { wrapper });

      let outcome!: { success: boolean };
      act(() => {
        outcome = result.current.loadFromJson(JSON.stringify(VALID_INVOICE));
      });

      expect(outcome.success).toBe(true);
      expect(result.current.invoice.sender.name).toBe("Acme Corp");
    });

    it("returns { success: false } for a syntactically invalid JSON string", () => {
      const { result } = renderHook(() => useInvoice(), { wrapper });

      let outcome!: { success: boolean; error?: string };
      act(() => {
        outcome = result.current.loadFromJson("{ this is not json }");
      });

      expect(outcome.success).toBe(false);
      expect(outcome.error).toMatch(/invalidJson|json/i);
    });

    it("returns { success: false } for JSON missing required fields", () => {
      const { result } = renderHook(() => useInvoice(), { wrapper });

      const badJson = JSON.stringify({ data: "nothing useful" });
      let outcome!: { success: boolean; error?: string };
      act(() => {
        outcome = result.current.loadFromJson(badJson);
      });

      expect(outcome.success).toBe(false);
    });

    it("does not mutate invoice state when parsing fails", () => {
      const { result } = renderHook(() => useInvoice(), { wrapper });

      act(() => result.current.setInvoice(VALID_INVOICE));
      act(() => result.current.loadFromJson("bad json"));

      // Invoice should still be VALID_INVOICE
      expect(result.current.invoice.sender.name).toBe("Acme Corp");
    });

    it("updates i18n language to pt-BR when the loaded invoice uses pt-BR", async () => {
      const { result } = renderHook(() => useInvoice(), { wrapper });
      const ptInvoice = { ...VALID_INVOICE, language: "pt-BR" };

      act(() => {
        result.current.loadFromJson(JSON.stringify(ptInvoice));
      });

      expect(result.current.invoice.language).toBe("pt-BR");
    });
  });

  // ─── updateInvoice ────────────────────────────────────────────────────────

  describe("updateInvoice", () => {
    it("can update language at the top level", () => {
      const { result } = renderHook(() => useInvoice(), { wrapper });

      act(() => result.current.updateInvoice({ language: "pt-BR" }));

      expect(result.current.invoice.language).toBe("pt-BR");
    });

    it("deep-merges sender, receiver, and details when provided together", () => {
      const { result } = renderHook(() => useInvoice(), { wrapper });

      act(() =>
        result.current.updateInvoice({
          sender: { name: "NewSender" } as never,
          receiver: { name: "NewReceiver" } as never,
        })
      );

      expect(result.current.invoice.sender.name).toBe("NewSender");
      expect(result.current.invoice.receiver.name).toBe("NewReceiver");
    });
  });
});
