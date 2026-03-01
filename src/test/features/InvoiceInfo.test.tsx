import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { InvoiceProvider } from "@/context/InvoiceContext";
import InvoiceInfo from "@/features/InvoiceInfo";

function renderInvoiceInfo() {
  return render(
    <InvoiceProvider>
      <InvoiceInfo />
    </InvoiceProvider>
  );
}

describe("InvoiceInfo", () => {
  // ─── default tab ───────────────────────────────────────────────────────────

  it("renders the 'From & To' tab content by default (page 0)", () => {
    renderInvoiceInfo();
    // FromAndTo renders two BillForm components whose headings come from translations
    expect(screen.getByText(/bill from/i)).toBeInTheDocument();
  });

  it("renders all 5 tab navigation buttons", () => {
    renderInvoiceInfo();
    expect(screen.getByRole("button", { name: /1\. from & to/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /2\. invoice details/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /3\. line items/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /4\. payment info/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /5\. summary/i })).toBeInTheDocument();
  });

  it("does not render the Back button on the first page", () => {
    renderInvoiceInfo();
    expect(screen.queryByRole("button", { name: /back/i })).not.toBeInTheDocument();
  });

  it("renders the Next button on the first page", () => {
    renderInvoiceInfo();
    expect(screen.getByRole("button", { name: /next/i })).toBeInTheDocument();
  });

  // ─── Next navigation ───────────────────────────────────────────────────────

  it("navigates to Invoice Details (page 1) when Next is clicked", async () => {
    const user = userEvent.setup();
    renderInvoiceInfo();

    await user.click(screen.getByRole("button", { name: /next/i }));

    // The h2 heading is rendered (tab button also says "Invoice Details" so query by heading role)
    expect(screen.getByRole("heading", { name: /invoice details/i })).toBeInTheDocument();
  });

  it("navigates to Line Items (page 2) after clicking Next twice", async () => {
    const user = userEvent.setup();
    renderInvoiceInfo();

    await user.click(screen.getByRole("button", { name: /next/i }));
    await user.click(screen.getByRole("button", { name: /next/i }));

    expect(screen.getByText(/items:/i)).toBeInTheDocument();
  });

  // ─── Back navigation ───────────────────────────────────────────────────────

  it("shows the Back button on page 1 and navigates back to page 0 when clicked", async () => {
    const user = userEvent.setup();
    renderInvoiceInfo();

    await user.click(screen.getByRole("button", { name: /next/i }));
    expect(screen.getByRole("button", { name: /back/i })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /back/i }));
    expect(screen.getByText(/bill from/i)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /back/i })).not.toBeInTheDocument();
  });

  // ─── Direct tab navigation ─────────────────────────────────────────────────

  it("navigates directly to Payment Info (page 3) when that tab button is clicked", async () => {
    const user = userEvent.setup();
    renderInvoiceInfo();

    await user.click(screen.getByRole("button", { name: /4\. payment info/i }));

    expect(screen.getByText(/payment information/i)).toBeInTheDocument();
  });

  it("navigates directly to Summary (page 4) when that tab button is clicked", async () => {
    const user = userEvent.setup();
    renderInvoiceInfo();

    await user.click(screen.getByRole("button", { name: /5\. summary/i }));

    expect(screen.getByText(/summary:/i)).toBeInTheDocument();
  });

  // ─── last page ─────────────────────────────────────────────────────────────

  it("disables the Next button on the last page (Summary)", async () => {
    const user = userEvent.setup();
    renderInvoiceInfo();

    await user.click(screen.getByRole("button", { name: /5\. summary/i }));

    expect(screen.getByRole("button", { name: /next/i })).toBeDisabled();
  });
});
