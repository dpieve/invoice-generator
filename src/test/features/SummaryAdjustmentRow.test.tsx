import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SummaryAdjustmentRow from "@/features/info/summary/SummaryAdjustmentRow";

const BASE_PROPS = {
  label: "Discount",
  enabled: false,
  onEnabledChange: vi.fn(),
  value: 0,
  onValueChange: vi.fn(),
  amountType: "amount" as const,
  onTypeToggle: vi.fn(),
  currency: "USD",
  toggleAriaLabel: "Toggle discount type",
};

describe("SummaryAdjustmentRow", () => {
  // ─── disabled state ────────────────────────────────────────────────────────

  it("renders the row label", () => {
    render(<SummaryAdjustmentRow {...BASE_PROPS} />);
    expect(screen.getByText("Discount")).toBeInTheDocument();
  });

  it("does not show the value input when disabled", () => {
    render(<SummaryAdjustmentRow {...BASE_PROPS} enabled={false} />);
    expect(screen.queryByRole("spinbutton")).not.toBeInTheDocument();
  });

  it("does not show the type-toggle button when disabled", () => {
    render(<SummaryAdjustmentRow {...BASE_PROPS} enabled={false} />);
    expect(
      screen.queryByRole("button", { name: "Toggle discount type" })
    ).not.toBeInTheDocument();
  });

  it("renders the switch in the unchecked state when disabled", () => {
    render(<SummaryAdjustmentRow {...BASE_PROPS} enabled={false} />);
    const switchEl = screen.getByRole("switch");
    expect(switchEl).toHaveAttribute("aria-checked", "false");
  });

  // ─── enabling via switch ───────────────────────────────────────────────────

  it("calls onEnabledChange(true) when the switch is clicked while disabled", async () => {
    const onEnabledChange = vi.fn();
    const user = userEvent.setup();
    render(
      <SummaryAdjustmentRow
        {...BASE_PROPS}
        enabled={false}
        onEnabledChange={onEnabledChange}
      />
    );

    await user.click(screen.getByRole("switch"));
    expect(onEnabledChange).toHaveBeenCalledWith(true);
  });

  // ─── enabled state ─────────────────────────────────────────────────────────

  it("shows the number input when enabled", () => {
    render(<SummaryAdjustmentRow {...BASE_PROPS} enabled={true} value={10} />);
    const input = screen.getByRole("spinbutton");
    expect(input).toBeInTheDocument();
    expect((input as HTMLInputElement).value).toBe("10");
  });

  it("shows the type-toggle button when enabled", () => {
    render(<SummaryAdjustmentRow {...BASE_PROPS} enabled={true} />);
    expect(
      screen.getByRole("button", { name: "Toggle discount type" })
    ).toBeInTheDocument();
  });

  it("displays the currency suffix when amountType is 'amount'", () => {
    render(
      <SummaryAdjustmentRow {...BASE_PROPS} enabled={true} amountType="amount" currency="EUR" />
    );
    expect(screen.getByText("EUR")).toBeInTheDocument();
  });

  it("displays the % suffix when amountType is 'percentage'", () => {
    render(
      <SummaryAdjustmentRow {...BASE_PROPS} enabled={true} amountType="percentage" />
    );
    expect(screen.getByText("%")).toBeInTheDocument();
  });

  // ─── type toggle ───────────────────────────────────────────────────────────

  it("calls onTypeToggle when the toggle button is clicked", async () => {
    const onTypeToggle = vi.fn();
    const user = userEvent.setup();
    render(
      <SummaryAdjustmentRow
        {...BASE_PROPS}
        enabled={true}
        onTypeToggle={onTypeToggle}
      />
    );

    await user.click(screen.getByRole("button", { name: "Toggle discount type" }));
    expect(onTypeToggle).toHaveBeenCalledTimes(1);
  });

  // ─── value change ──────────────────────────────────────────────────────────

  it("calls onValueChange with the parsed number when the input changes", () => {
    const onValueChange = vi.fn();
    render(
      <SummaryAdjustmentRow
        {...BASE_PROPS}
        enabled={true}
        onValueChange={onValueChange}
      />
    );

    const input = screen.getByRole("spinbutton");
    fireEvent.change(input, { target: { value: "25" } });
    expect(onValueChange).toHaveBeenCalledWith(25);
  });

  it("calls onValueChange(0) when the input is cleared", () => {
    const onValueChange = vi.fn();
    render(
      <SummaryAdjustmentRow
        {...BASE_PROPS}
        enabled={true}
        value={10}
        onValueChange={onValueChange}
      />
    );

    const input = screen.getByRole("spinbutton");
    fireEvent.change(input, { target: { value: "" } });
    expect(onValueChange).toHaveBeenCalledWith(0);
  });

  // ─── disabled again ────────────────────────────────────────────────────────

  it("calls onEnabledChange(false) when switch is clicked while enabled", async () => {
    const onEnabledChange = vi.fn();
    const user = userEvent.setup();
    render(
      <SummaryAdjustmentRow
        {...BASE_PROPS}
        enabled={true}
        onEnabledChange={onEnabledChange}
      />
    );

    await user.click(screen.getByRole("switch"));
    expect(onEnabledChange).toHaveBeenCalledWith(false);
  });
});
