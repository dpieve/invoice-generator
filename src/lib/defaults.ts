import type { Invoice, LineItem } from "@/types/invoice";

function createDefaultItem(overrides?: Partial<LineItem>): LineItem {
  return {
    id: crypto.randomUUID(),
    name: "",
    description: "",
    quantity: 0,
    unitPrice: 0,
    total: 0,
    ...overrides,
  };
}

export function getDefaultInvoice(): Invoice {
  const today = new Date().toISOString().slice(0, 10);
  return {
    language: "en",
    sender: {
      name: "",
      address: "",
      zipCode: "",
      city: "",
      country: "",
      email: "",
      phone: "",
      customInputs: [],
    },
    receiver: {
      name: "",
      address: "",
      zipCode: "",
      city: "",
      country: "",
      email: "",
      phone: "",
      customInputs: [],
    },
    details: {
      invoiceLogo: "",
      invoiceNumber: "1",
      invoiceDate: today,
      dueDate: today,
      currency: "USD",
      items: [createDefaultItem()],
      paymentInformation: {
        bankName: "",
        accountName: "",
        accountNumber: "",
      },
      discountDetails: { amount: 0, amountType: "amount" },
      taxDetails: { amount: 0, amountType: "amount" },
      shippingDetails: { cost: 0, costType: "amount" },
      discountEnabled: false,
      taxEnabled: false,
      shippingEnabled: false,
      subTotal: 0,
      totalAmount: 0,
      totalAmountInWords: "",
      includeTotalInWords: true,
      additionalNotes: "",
      paymentTerms: "",
      signature: undefined,
    },
  };
}

export { createDefaultItem };
