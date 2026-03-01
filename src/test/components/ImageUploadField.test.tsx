import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ImageUploadField from "@/components/ImageUploadField";

const BASE_PROPS = {
  label: "Invoice Logo",
  uploadPlaceholder: "Click to upload image",
  removeAriaLabel: "Remove logo",
  imageAlt: "Invoice logo",
  inputId: "logo-input",
  onSelect: vi.fn(),
  onRemove: vi.fn(),
};

const FAKE_DATA_URL = "data:image/png;base64,ABC123";

describe("ImageUploadField", () => {
  // ─── empty state ───────────────────────────────────────────────────────────

  it("shows the upload placeholder label when no value is provided", () => {
    render(<ImageUploadField {...BASE_PROPS} value={undefined} />);
    expect(screen.getByText("Click to upload image")).toBeInTheDocument();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("does not show the remove button when there is no image", () => {
    render(<ImageUploadField {...BASE_PROPS} value={undefined} />);
    expect(
      screen.queryByRole("button", { name: "Remove logo" })
    ).not.toBeInTheDocument();
  });

  // ─── image loaded state ────────────────────────────────────────────────────

  it("renders the image element when a data URL value is supplied", () => {
    render(<ImageUploadField {...BASE_PROPS} value={FAKE_DATA_URL} />);
    expect(screen.getByRole("img", { name: "Invoice logo" })).toBeInTheDocument();
  });

  it("hides the upload placeholder when an image is displayed", () => {
    render(<ImageUploadField {...BASE_PROPS} value={FAKE_DATA_URL} />);
    expect(screen.queryByText("Click to upload image")).not.toBeInTheDocument();
  });

  it("shows the remove button when an image is displayed", () => {
    render(<ImageUploadField {...BASE_PROPS} value={FAKE_DATA_URL} />);
    expect(
      screen.getByRole("button", { name: "Remove logo" })
    ).toBeInTheDocument();
  });

  // ─── remove interaction ────────────────────────────────────────────────────

  it("calls onRemove when the remove button is clicked", async () => {
    const onRemove = vi.fn();
    const user = userEvent.setup();
    render(<ImageUploadField {...BASE_PROPS} value={FAKE_DATA_URL} onRemove={onRemove} />);

    await user.click(screen.getByRole("button", { name: "Remove logo" }));

    expect(onRemove).toHaveBeenCalledTimes(1);
  });

  // ─── file selection ────────────────────────────────────────────────────────

  it("calls onSelect with the uploaded File object when a file is chosen", () => {
    const onSelect = vi.fn();
    render(<ImageUploadField {...BASE_PROPS} value={undefined} onSelect={onSelect} />);

    const fileInput = document.querySelector<HTMLInputElement>('input[type="file"]')!;
    const fakeFile = new File(["png-data"], "logo.png", { type: "image/png" });

    fireEvent.change(fileInput, { target: { files: [fakeFile] } });

    expect(onSelect).toHaveBeenCalledWith(fakeFile);
  });

  it("does not call onSelect when no file is chosen (empty file list)", () => {
    const onSelect = vi.fn();
    render(<ImageUploadField {...BASE_PROPS} value={undefined} onSelect={onSelect} />);

    const fileInput = document.querySelector<HTMLInputElement>('input[type="file"]')!;
    fireEvent.change(fileInput, { target: { files: [] } });

    expect(onSelect).not.toHaveBeenCalled();
  });

  // ─── optional "Change" button ──────────────────────────────────────────────

  it("shows a Change button when changeButtonLabel is provided and image is present", () => {
    render(
      <ImageUploadField
        {...BASE_PROPS}
        value={FAKE_DATA_URL}
        changeButtonLabel="Change"
      />
    );
    expect(screen.getByRole("button", { name: "Change" })).toBeInTheDocument();
  });

  it("does not show a Change button when changeButtonLabel is omitted", () => {
    render(<ImageUploadField {...BASE_PROPS} value={FAKE_DATA_URL} />);
    expect(screen.queryByRole("button", { name: "Change" })).not.toBeInTheDocument();
  });
});
