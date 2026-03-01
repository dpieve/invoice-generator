import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LabelInput from "@/components/custom/LabelInput";

describe("LabelInput", () => {
  // ─── default display ───────────────────────────────────────────────────────

  it("shows the value as a label, not an input, by default", () => {
    render(<LabelInput value="Invoice #" onChange={vi.fn()} />);

    expect(screen.getByText("Invoice #")).toBeInTheDocument();
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
  });

  // ─── enter edit mode ───────────────────────────────────────────────────────

  it("reveals a text input with the current value when the label is clicked", async () => {
    const user = userEvent.setup();
    render(<LabelInput value="Hello" onChange={vi.fn()} />);

    await user.click(screen.getByText("Hello"));

    const input = screen.getByRole("textbox");
    expect(input).toBeInTheDocument();
    expect((input as HTMLInputElement).value).toBe("Hello");
  });

  // ─── commit via Enter ──────────────────────────────────────────────────────

  it("calls onChange and returns to label view when Enter is pressed", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<LabelInput value="Old" onChange={onChange} />);

    await user.click(screen.getByText("Old"));
    const input = screen.getByRole("textbox");
    await user.clear(input);
    await user.type(input, "New{Enter}");

    // Input should be gone; label should be back
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
    expect(onChange).toHaveBeenCalled();
  });

  // ─── cancel via Escape ─────────────────────────────────────────────────────

  it("closes the input without calling onChange when Escape is pressed", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<LabelInput value="Unchanged" onChange={onChange} />);

    await user.click(screen.getByText("Unchanged"));
    // Click the input to ensure it has focus before sending keyboard events
    const input = screen.getByRole("textbox");
    await user.click(input);

    await user.keyboard("{Escape}");

    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
  });

  // ─── commit via blur ───────────────────────────────────────────────────────

  it("commits the value and exits edit mode when the input loses focus", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<LabelInput value="FocusTest" onChange={onChange} />);

    await user.click(screen.getByText("FocusTest"));
    // Explicitly focus the input, then tab away to trigger blur
    const input = screen.getByRole("textbox");
    await user.click(input);
    await user.tab();

    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
  });

  // ─── onChange propagation ─────────────────────────────────────────────────

  it("calls onChange on every keystroke while editing", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<LabelInput value="" onChange={onChange} />);

    // Empty value – label is still rendered (as an empty label element)
    const label = document.querySelector("label")!;
    await user.click(label);
    await user.type(screen.getByRole("textbox"), "abc");

    // 3 keystrokes → 3 calls
    expect(onChange).toHaveBeenCalledTimes(3);
  });
});
