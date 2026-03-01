import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import BillForm from "@/features/info/bills/BillForm";
import type { SenderReceiver } from "@/types/invoice";

const EMPTY_SENDER: SenderReceiver = {
  name: "",
  address: "",
  zipCode: "",
  city: "",
  country: "",
  email: "",
  phone: "",
  customInputs: [],
};

const FILLED_SENDER: SenderReceiver = {
  name: "Acme Corp",
  address: "123 Main St",
  zipCode: "10001",
  city: "New York",
  country: "US",
  email: "acme@example.com",
  phone: "+1-555-0100",
  customInputs: [],
};

describe("BillForm", () => {
  // ─── rendering ─────────────────────────────────────────────────────────────

  it("renders all standard input fields", () => {
    render(
      <BillForm
        title="Bill From"
        data={EMPTY_SENDER}
        onUpdate={vi.fn()}
        fromPlaceholders={true}
      />
    );
    // Presence of all placeholder texts confirms all fields render
    expect(screen.getByPlaceholderText("Your name")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Your address")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Your zip code")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Your city")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Your country")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Your email")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Your phone number")).toBeInTheDocument();
  });

  it("shows the form title", () => {
    render(
      <BillForm title="Bill From:" data={EMPTY_SENDER} onUpdate={vi.fn()} />
    );
    expect(screen.getByText("Bill From:")).toBeInTheDocument();
  });

  it("pre-fills field values from the data prop", () => {
    render(
      <BillForm title="Test" data={FILLED_SENDER} onUpdate={vi.fn()} fromPlaceholders={true} />
    );
    expect(
      (screen.getByPlaceholderText("Your name") as HTMLInputElement).value
    ).toBe("Acme Corp");
  });

  it("uses 'Receiver' placeholders when fromPlaceholders is false", () => {
    render(
      <BillForm title="Bill To" data={EMPTY_SENDER} onUpdate={vi.fn()} fromPlaceholders={false} />
    );
    expect(screen.getByPlaceholderText("Receiver name")).toBeInTheDocument();
  });

  // ─── field updates ─────────────────────────────────────────────────────────

  it("calls onUpdate with { name } when the name field is changed", () => {
    const onUpdate = vi.fn();
    // Use fireEvent.change to set value atomically on a controlled input
    // (user.type would call onUpdate once per character since the spy never updates the prop)
    const { getByPlaceholderText } = render(
      <BillForm title="Test" data={EMPTY_SENDER} onUpdate={onUpdate} fromPlaceholders={true} />
    );

    fireEvent.change(getByPlaceholderText("Your name"), { target: { value: "Jane" } });

    expect(onUpdate).toHaveBeenCalledWith({ name: "Jane" });
  });

  it("calls onUpdate with { email } when the email field is changed", () => {
    const onUpdate = vi.fn();
    const { getByPlaceholderText } = render(
      <BillForm title="Test" data={EMPTY_SENDER} onUpdate={onUpdate} fromPlaceholders={true} />
    );

    fireEvent.change(getByPlaceholderText("Your email"), { target: { value: "test@example.com" } });

    expect(onUpdate).toHaveBeenCalledWith({ email: "test@example.com" });
  });

  // ─── custom inputs ─────────────────────────────────────────────────────────

  it("shows no custom input rows initially when customInputs is empty", () => {
    render(<BillForm title="Test" data={EMPTY_SENDER} onUpdate={vi.fn()} />);
    expect(screen.queryByPlaceholderText("Key")).not.toBeInTheDocument();
    expect(screen.queryByPlaceholderText("Value")).not.toBeInTheDocument();
  });

  it("calls onUpdate with a new custom input when 'Add Custom Input' is clicked", async () => {
    const onUpdate = vi.fn();
    const user = userEvent.setup();
    render(<BillForm title="Test" data={EMPTY_SENDER} onUpdate={onUpdate} />);

    await user.click(screen.getByRole("button", { name: /add custom input/i }));

    expect(onUpdate).toHaveBeenCalledWith({
      customInputs: [{ key: "", value: "" }],
    });
  });

  it("renders existing custom input rows from data.customInputs", () => {
    const senderWithCustom: SenderReceiver = {
      ...EMPTY_SENDER,
      customInputs: [{ key: "VAT", value: "DE123456" }],
    };
    render(<BillForm title="Test" data={senderWithCustom} onUpdate={vi.fn()} />);
    expect((screen.getByPlaceholderText("Key") as HTMLInputElement).value).toBe("VAT");
    expect((screen.getByPlaceholderText("Value") as HTMLInputElement).value).toBe("DE123456");
  });

  it("calls onUpdate with updated customInputs when a custom key field changes", async () => {
    const onUpdate = vi.fn();
    const user = userEvent.setup();
    const senderWithCustom: SenderReceiver = {
      ...EMPTY_SENDER,
      customInputs: [{ key: "", value: "" }],
    };
    render(<BillForm title="Test" data={senderWithCustom} onUpdate={onUpdate} />);

    await user.type(screen.getByPlaceholderText("Key"), "X");

    const lastCall = onUpdate.mock.calls[onUpdate.mock.calls.length - 1][0];
    expect(lastCall.customInputs[0].key).toBe("X");
  });

  it("calls onUpdate with the custom input removed when the remove button is clicked", async () => {
    const onUpdate = vi.fn();
    const user = userEvent.setup();
    const senderWithCustom: SenderReceiver = {
      ...EMPTY_SENDER,
      customInputs: [{ key: "VAT", value: "DE" }],
    };
    render(<BillForm title="Test" data={senderWithCustom} onUpdate={onUpdate} />);

    await user.click(
      screen.getByRole("button", { name: /remove custom field/i })
    );

    expect(onUpdate).toHaveBeenCalledWith({ customInputs: [] });
  });
});
