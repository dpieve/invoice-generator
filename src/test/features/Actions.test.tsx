import { describe, it, expect, vi, beforeAll, afterAll } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useEffect, useState } from "react";
import { InvoiceProvider, useInvoice } from "@/context/InvoiceContext";
import Actions from "@/features/Actions";
import type { Invoice } from "@/types/invoice";
import type { ReactNode } from "react";
import { VALID_INVOICE } from "../fixtures";

// ─── module mocks ─────────────────────────────────────────────────────────────

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

// ─── stubs needed for the save fallback path ──────────────────────────────────

beforeAll(() => {
  URL.createObjectURL = vi.fn(() => "blob:mock-url");
  URL.revokeObjectURL = vi.fn();
});

afterAll(() => {
  vi.restoreAllMocks();
});

// ─── helpers ─────────────────────────────────────────────────────────────────

/** Injects a specific invoice into the nearest InvoiceProvider, then shows children. */
function InvoiceSeed({ invoice, children }: { invoice: Invoice; children: ReactNode }) {
  const { setInvoice } = useInvoice();
  const [ready, setReady] = useState(false);
  useEffect(() => {
    setInvoice(invoice);
    setReady(true);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return ready ? <>{children}</> : null;
}

/** Exposes the current invoice dates and number for assertion. */
function InvoiceDisplay() {
  const { invoice } = useInvoice();
  return (
    <>
      <span data-testid="invoiceDate">{invoice.details.invoiceDate}</span>
      <span data-testid="dueDate">{invoice.details.dueDate}</span>
      <span data-testid="invoiceNumber">{invoice.details.invoiceNumber}</span>
      <span data-testid="language">{invoice.language}</span>
    </>
  );
}

// ─── tests ────────────────────────────────────────────────────────────────────

describe("Actions", () => {
  // ─── rendering ─────────────────────────────────────────────────────────────

  it("renders primary action buttons", () => {
    render(
      <InvoiceProvider>
        <Actions />
      </InvoiceProvider>
    );
    expect(screen.getByRole("button", { name: /load/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /save/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /reset form/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /generate pdf/i })).toBeInTheDocument();
  });

  // ─── Reset Form ────────────────────────────────────────────────────────────

  it("resets the invoice to defaults when 'Reset Form' is clicked", async () => {
    const user = userEvent.setup();
    render(
      <InvoiceProvider>
        <InvoiceSeed invoice={VALID_INVOICE}>
          <>
            <Actions />
            <InvoiceDisplay />
          </>
        </InvoiceSeed>
      </InvoiceProvider>
    );

    // Wait for invoice to be seeded
    await waitFor(() => {
      expect(screen.getByTestId("invoiceNumber").textContent).toBe("INV-001");
    });

    await user.click(screen.getByRole("button", { name: /reset form/i }));

    // After reset, invoice number goes back to default "1"
    expect(screen.getByTestId("invoiceNumber").textContent).toBe("1");
  });

  // ─── Generate PDF — invalid invoice ────────────────────────────────────────

  it("shows an error dialog when Generate PDF is clicked with an invalid invoice", async () => {
    const user = userEvent.setup();
    const onGeneratePdf = vi.fn();
    render(
      <InvoiceProvider>
        <Actions onGeneratePdf={onGeneratePdf} />
      </InvoiceProvider>
    );

    // Default invoice has empty sender name, receiver name, paymentTerms → validation fails
    await user.click(screen.getByRole("button", { name: /generate pdf/i }));

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(onGeneratePdf).not.toHaveBeenCalled();
  });

  it("closes the error dialog when OK is clicked", async () => {
    const user = userEvent.setup();
    render(
      <InvoiceProvider>
        <Actions />
      </InvoiceProvider>
    );

    await user.click(screen.getByRole("button", { name: /generate pdf/i }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /^ok$/i }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  // ─── Generate PDF — valid invoice ──────────────────────────────────────────

  it("calls onGeneratePdf when Generate PDF is clicked with a valid invoice", async () => {
    const user = userEvent.setup();
    const onGeneratePdf = vi.fn();
    render(
      <InvoiceProvider>
        <InvoiceSeed invoice={VALID_INVOICE}>
          <Actions onGeneratePdf={onGeneratePdf} />
        </InvoiceSeed>
      </InvoiceProvider>
    );

    await waitFor(() =>
      expect(screen.getByRole("button", { name: /generate pdf/i })).toBeInTheDocument()
    );

    await user.click(screen.getByRole("button", { name: /generate pdf/i }));

    expect(onGeneratePdf).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  // ─── Issue Today & Due 30 ──────────────────────────────────────────────────

  it("sets invoiceDate to today and dueDate to +30 days", async () => {
    const user = userEvent.setup();
    render(
      <InvoiceProvider>
        <>
          <Actions />
          <InvoiceDisplay />
        </>
      </InvoiceProvider>
    );

    const today = new Date().toISOString().slice(0, 10);
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30);
    const expectedDue = dueDate.toISOString().slice(0, 10);

    await user.click(
      screen.getByRole("button", { name: /issue today.*due.*30/i })
    );

    expect(screen.getByTestId("invoiceDate").textContent).toBe(today);
    expect(screen.getByTestId("dueDate").textContent).toBe(expectedDue);
  });

  // ─── Invoice number increment / decrement ──────────────────────────────────

  it("increments the invoice number", async () => {
    const user = userEvent.setup();
    render(
      <InvoiceProvider>
        <>
          <Actions />
          <InvoiceDisplay />
        </>
      </InvoiceProvider>
    );

    // Default is "1"; find the increment button (Invoice # with right chevron)
    const buttons = screen.getAllByRole("button", { name: /invoice #/i });
    // Increment button is the second one (right chevron)
    const incrementBtn = buttons[buttons.length - 1]!;
    await user.click(incrementBtn);

    expect(screen.getByTestId("invoiceNumber").textContent).toBe("2");
  });

  it("decrements the invoice number", async () => {
    const user = userEvent.setup();
    render(
      <InvoiceProvider>
        <InvoiceSeed invoice={{ ...VALID_INVOICE, details: { ...VALID_INVOICE.details, invoiceNumber: "5" } }}>
          <>
            <Actions />
            <InvoiceDisplay />
          </>
        </InvoiceSeed>
      </InvoiceProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("invoiceNumber").textContent).toBe("5");
    });

    const buttons = screen.getAllByRole("button", { name: /invoice #/i });
    // Decrement button is the first one (left chevron)
    const decrementBtn = buttons[0]!;
    await user.click(decrementBtn);

    expect(screen.getByTestId("invoiceNumber").textContent).toBe("4");
  });

  it("does not decrement the invoice number below 1", async () => {
    const user = userEvent.setup();
    render(
      <InvoiceProvider>
        <>
          <Actions />
          <InvoiceDisplay />
        </>
      </InvoiceProvider>
    );

    // Default is "1"; decrement should not go below 1
    const buttons = screen.getAllByRole("button", { name: /invoice #/i });
    const decrementBtn = buttons[0]!;
    await user.click(decrementBtn);

    expect(screen.getByTestId("invoiceNumber").textContent).toBe("1");
  });

  // ─── Save ──────────────────────────────────────────────────────────────────

  it("calls the save fallback when Save is clicked (no native file picker)", async () => {
    const { toast } = await import("sonner");
    const user = userEvent.setup();
    render(
      <InvoiceProvider>
        <Actions />
      </InvoiceProvider>
    );

    await user.click(screen.getByRole("button", { name: /^save$/i }));

    // The fallback save path succeeds with fileName "invoice.json"
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalled();
    });
  });
});
