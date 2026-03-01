import { describe, it, expect } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useEffect, useState } from "react";
import { InvoiceProvider, useInvoice } from "@/context/InvoiceContext";
import LineItems from "@/features/info/items/LineItems";
import type { Invoice } from "@/types/invoice";
import type { ReactNode } from "react";
// ─── helpers ─────────────────────────────────────────────────────────────────

/** Seeds the nearest InvoiceProvider with a specific invoice then renders children. */
function InvoiceSeed({
  invoice,
  children,
}: {
  invoice: Invoice;
  children: ReactNode;
}) {
  const { setInvoice } = useInvoice();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setInvoice(invoice);
    setReady(true);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return ready ? <>{children}</> : null;
}

const TWO_ITEM_INVOICE: Invoice = {
  language: "en",
  sender: { name: "A", address: "", zipCode: "", city: "", country: "", email: "", phone: "", customInputs: [] },
  receiver: { name: "B", address: "", zipCode: "", city: "", country: "", email: "", phone: "", customInputs: [] },
  details: {
    invoiceLogo: "",
    invoiceNumber: "1",
    invoiceDate: "2026-01-01",
    dueDate: "2026-01-31",
    currency: "USD",
    items: [
      { id: "i1", name: "Design", description: "", quantity: 2, unitPrice: 100, total: 200 },
      { id: "i2", name: "Development", description: "", quantity: 5, unitPrice: 80, total: 400 },
    ],
    paymentInformation: { bankName: "", accountName: "", accountNumber: "" },
    discountDetails: { amount: 0, amountType: "amount" },
    taxDetails: { amount: 0, amountType: "amount" },
    shippingDetails: { cost: 0, costType: "amount" },
    discountEnabled: false,
    taxEnabled: false,
    shippingEnabled: false,
    subTotal: 600,
    totalAmount: 600,
    totalAmountInWords: "",
    includeTotalInWords: false,
    additionalNotes: "",
    paymentTerms: "Net 30",
  },
};

// ─── tests ───────────────────────────────────────────────────────────────────

describe("LineItems", () => {
  // ─── rendering ─────────────────────────────────────────────────────────────

  it("renders one row for the default single line item on first mount", () => {
    render(
      <InvoiceProvider>
        <LineItems />
      </InvoiceProvider>
    );
    expect(screen.getAllByRole("button", { name: /^remove item$/i })).toHaveLength(1);
  });

  it("renders all line items when the invoice has multiple items", async () => {
    render(
      <InvoiceProvider>
        <InvoiceSeed invoice={TWO_ITEM_INVOICE}>
          <LineItems />
        </InvoiceSeed>
      </InvoiceProvider>
    );

    // Item names appear as input values (controlled) – use getByDisplayValue
    await waitFor(() => {
      expect(screen.getByDisplayValue("Design")).toBeInTheDocument();
    });
    expect(screen.getByDisplayValue("Development")).toBeInTheDocument();
  });

  it("displays the section heading", () => {
    render(
      <InvoiceProvider>
        <LineItems />
      </InvoiceProvider>
    );
    expect(screen.getByText(/items:/i)).toBeInTheDocument();
  });

  // ─── add item ──────────────────────────────────────────────────────────────

  it("adds a new blank row when 'Add a new item' is clicked", async () => {
    const user = userEvent.setup();
    render(
      <InvoiceProvider>
        <LineItems />
      </InvoiceProvider>
    );

    await user.click(screen.getByRole("button", { name: /add a new item/i }));

    expect(screen.getAllByRole("button", { name: /^remove item$/i })).toHaveLength(2);
  });

  it("shows the 'Add a new item' button at all times", () => {
    render(
      <InvoiceProvider>
        <LineItems />
      </InvoiceProvider>
    );
    expect(screen.getByRole("button", { name: /add a new item/i })).toBeInTheDocument();
  });

  // ─── remove flow ────────────────────────────────────────────────────────────

  it("shows a confirmation alert dialog when Remove item is clicked", async () => {
    const user = userEvent.setup();
    render(
      <InvoiceProvider>
        <LineItems />
      </InvoiceProvider>
    );

    // Need 2 items so the list is not exhausted; add one
    await user.click(screen.getByRole("button", { name: /add a new item/i }));
    await user.click(screen.getAllByRole("button", { name: /^remove item$/i })[0]!);

    expect(screen.getByRole("alertdialog")).toBeInTheDocument();
    expect(screen.getByText(/remove item\?/i)).toBeInTheDocument();
  });

  it("removes the item after confirming in the alert dialog", async () => {
    const user = userEvent.setup();
    render(
      <InvoiceProvider>
        <LineItems />
      </InvoiceProvider>
    );

    await user.click(screen.getByRole("button", { name: /add a new item/i }));
    // Now 2 rows; remove the first
    await user.click(screen.getAllByRole("button", { name: /^remove item$/i })[0]!);
    await user.click(screen.getByRole("button", { name: /^remove$/i }));

    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /^remove item$/i })).toHaveLength(1);
  });

  it("cancels removal when Cancel is clicked in the dialog", async () => {
    const user = userEvent.setup();
    render(
      <InvoiceProvider>
        <LineItems />
      </InvoiceProvider>
    );

    await user.click(screen.getByRole("button", { name: /add a new item/i }));
    await user.click(screen.getAllByRole("button", { name: /^remove item$/i })[0]!);
    await user.click(screen.getByRole("button", { name: /^cancel$/i }));

    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
    // Both rows still present
    expect(screen.getAllByRole("button", { name: /^remove item$/i })).toHaveLength(2);
  });

  // ─── remove last item ────────────────────────────────────────────────────────

  it("keeps exactly one blank row after removing the last item (never leaves empty list)", async () => {
    const user = userEvent.setup();
    render(
      <InvoiceProvider>
        <LineItems />
      </InvoiceProvider>
    );

    // Only 1 item in the default invoice
    await user.click(screen.getByRole("button", { name: /^remove item$/i }));
    await user.click(screen.getByRole("button", { name: /^remove$/i }));

    // The list must still have exactly one row (a new blank item was inserted)
    expect(screen.getAllByRole("button", { name: /^remove item$/i })).toHaveLength(1);
  });

  // ─── item field updates ───────────────────────────────────────────────────

  it("updates the unit price input value when the user types in it", async () => {
    const user = userEvent.setup();
    render(
      <InvoiceProvider>
        <LineItems />
      </InvoiceProvider>
    );

    // two spinbuttons per row: [0] = quantity, [1] = unit price
    const [, priceInput] = screen.getAllByRole("spinbutton");
    await user.clear(priceInput!);
    await user.type(priceInput!, "50");

    expect((priceInput as HTMLInputElement).value).toBe("50");
  });
});

