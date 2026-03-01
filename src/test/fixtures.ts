import type { Invoice } from "@/types/invoice";

/** A fully valid invoice that passes schema validation. */
export const VALID_INVOICE: Invoice = {
  language: "en",
  sender: {
    name: "Acme Corp",
    address: "123 Sender St",
    zipCode: "10001",
    city: "New York",
    country: "US",
    email: "sender@acme.com",
    phone: "+1-555-0100",
    customInputs: [],
  },
  receiver: {
    name: "Client Inc",
    address: "456 Receiver Ave",
    zipCode: "90001",
    city: "Los Angeles",
    country: "US",
    email: "receiver@client.com",
    phone: "+1-555-0200",
    customInputs: [],
  },
  details: {
    invoiceLogo: "",
    invoiceNumber: "INV-001",
    invoiceDate: "2026-03-01",
    dueDate: "2026-03-31",
    currency: "USD",
    items: [
      {
        id: "item-1",
        name: "Web Development",
        description: "Frontend development services",
        quantity: 10,
        unitPrice: 100,
        total: 1000,
      },
    ],
    paymentInformation: {
      bankName: "First National Bank",
      accountName: "Acme Corp",
      accountNumber: "123456789",
    },
    discountDetails: { amount: 0, amountType: "amount" },
    taxDetails: { amount: 0, amountType: "amount" },
    shippingDetails: { cost: 0, costType: "amount" },
    discountEnabled: false,
    taxEnabled: false,
    shippingEnabled: false,
    subTotal: 1000,
    totalAmount: 1000,
    totalAmountInWords: "One thousand USD",
    includeTotalInWords: true,
    additionalNotes: "Thank you for your business!",
    paymentTerms: "Net 30",
    signature: undefined,
  },
};

/** Invoice with two line items for testing multi-item operations. */
export const MULTI_ITEM_INVOICE: Invoice = {
  ...VALID_INVOICE,
  details: {
    ...VALID_INVOICE.details,
    items: [
      {
        id: "item-1",
        name: "Design",
        description: "",
        quantity: 5,
        unitPrice: 200,
        total: 1000,
      },
      {
        id: "item-2",
        name: "Development",
        description: "",
        quantity: 10,
        unitPrice: 100,
        total: 1000,
      },
    ],
  },
};
