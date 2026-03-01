import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ErrorDialog from "@/components/ErrorDialog";

const DEFAULT_PROPS = {
  title: "Something went wrong",
  message: "Please check your input and try again.",
  closeLabel: "OK",
  onOpenChange: vi.fn(),
};

describe("ErrorDialog", () => {
  // ─── closed state ──────────────────────────────────────────────────────────

  it("does not render dialog content when open is false", () => {
    render(<ErrorDialog {...DEFAULT_PROPS} open={false} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  // ─── open state ────────────────────────────────────────────────────────────

  it("renders the dialog title when open is true", () => {
    render(<ErrorDialog {...DEFAULT_PROPS} open={true} />);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
  });

  it("renders the message body when open is true", () => {
    render(<ErrorDialog {...DEFAULT_PROPS} open={true} />);
    expect(
      screen.getByText("Please check your input and try again.")
    ).toBeInTheDocument();
  });

  it("renders the close button with the supplied label", () => {
    render(<ErrorDialog {...DEFAULT_PROPS} open={true} />);
    expect(screen.getByRole("button", { name: "OK" })).toBeInTheDocument();
  });

  // ─── close interaction ─────────────────────────────────────────────────────

  it("calls onOpenChange(false) when the close button is clicked", async () => {
    const onOpenChange = vi.fn();
    const user = userEvent.setup();
    render(<ErrorDialog {...DEFAULT_PROPS} open={true} onOpenChange={onOpenChange} />);

    await user.click(screen.getByRole("button", { name: "OK" }));

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  // ─── edge cases ────────────────────────────────────────────────────────────

  it("renders an empty string instead of null when message is null", () => {
    render(
      <ErrorDialog {...DEFAULT_PROPS} open={true} message={null} />
    );
    // Should not throw; dialog still visible
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("renders each line of a multi-line message in the dialog body", () => {
    const multiLine = "Line one\nLine two\nLine three";
    render(<ErrorDialog {...DEFAULT_PROPS} open={true} message={multiLine} />);
    // RTL normalises whitespace, so search each line individually
    expect(screen.getByText(/Line one/)).toBeInTheDocument();
    expect(screen.getByText(/Line two/)).toBeInTheDocument();
    expect(screen.getByText(/Line three/)).toBeInTheDocument();
  });
});
