import type {
  Invoice,
  InvoiceLanguage,
  LineItem,
  DiscountDetails,
  ShippingDetails,
} from "@/types/invoice";

function normalizeLineItem(item: unknown, index: number): LineItem {
  const i = item as Record<string, unknown>;
  const id = typeof i.id === "string" ? i.id : `item-${index}-${Date.now()}`;
  const q = Number(i.quantity) || 0;
  const up = Number(i.unitPrice) || 0;
  return {
    id,
    name: String(i.name ?? ""),
    description: String(i.description ?? ""),
    quantity: q,
    unitPrice: up,
    total: (Number(i.total) ?? q * up) || 0,
  };
}

function normalizeAmountType(
  raw: { amount?: number; amountType?: string } | undefined
): DiscountDetails {
  if (!raw) return { amount: 0, amountType: "amount" };
  return {
    amount: Number(raw.amount) || 0,
    amountType: raw.amountType === "percentage" ? "percentage" : "amount",
  };
}

function normalizeCostType(
  raw: { cost?: number; costType?: string } | undefined
): ShippingDetails {
  if (!raw) return { cost: 0, costType: "amount" };
  return {
    cost: Number(raw.cost) || 0,
    costType: raw.costType === "percentage" ? "percentage" : "amount",
  };
}

export function parseInvoiceFromObject(parsed: unknown): Invoice {
  if (!parsed || typeof parsed !== "object") {
    throw new Error("Invalid JSON");
  }
  const obj = parsed as Record<string, unknown>;
  if (!obj.sender || !obj.receiver || !obj.details) {
    throw new Error("Missing required fields");
  }

  const details = obj.details as Record<string, unknown>;
  const itemsRaw = Array.isArray(details.items) ? details.items : [];
  const normalizedItems = itemsRaw.map((item: unknown, index: number) =>
    normalizeLineItem(item, index)
  );
  const items =
    normalizedItems.length > 0
      ? normalizedItems
      : [
          {
            id: crypto.randomUUID(),
            name: "",
            description: "",
            quantity: 0,
            unitPrice: 0,
            total: 0,
          },
        ];

  const sender = obj.sender as Record<string, unknown>;
  const receiver = obj.receiver as Record<string, unknown>;
  const payment = details.paymentInformation as Record<string, unknown> | undefined;
  const language: InvoiceLanguage = obj.language === "pt-BR" ? "pt-BR" : "en";
  const today = new Date().toISOString().slice(0, 10);

  return {
    language,
    sender: {
      name: String(sender.name ?? ""),
      address: String(sender.address ?? ""),
      zipCode: String(sender.zipCode ?? ""),
      city: String(sender.city ?? ""),
      country: String(sender.country ?? ""),
      email: String(sender.email ?? ""),
      phone: String(sender.phone ?? ""),
      customInputs: Array.isArray(sender.customInputs)
        ? (sender.customInputs as { key: string; value: string }[])
        : [],
    },
    receiver: {
      name: String(receiver.name ?? ""),
      address: String(receiver.address ?? ""),
      zipCode: String(receiver.zipCode ?? ""),
      city: String(receiver.city ?? ""),
      country: String(receiver.country ?? ""),
      email: String(receiver.email ?? ""),
      phone: String(receiver.phone ?? ""),
      customInputs: Array.isArray(receiver.customInputs)
        ? (receiver.customInputs as { key: string; value: string }[])
        : [],
    },
    details: {
      invoiceLogo: String(details.invoiceLogo ?? ""),
      invoiceNumber: String(details.invoiceNumber ?? ""),
      invoiceDate: String(details.invoiceDate ?? today),
      dueDate: String(details.dueDate ?? today),
      currency: String(details.currency ?? "USD"),
      items,
      paymentInformation: payment
        ? {
            bankName: String(payment.bankName ?? ""),
            accountName: String(payment.accountName ?? ""),
            accountNumber: String(payment.accountNumber ?? ""),
          }
        : undefined,
      discountDetails: normalizeAmountType(
        details.discountDetails as { amount?: number; amountType?: string } | undefined
      ),
      taxDetails: normalizeAmountType(
        details.taxDetails as { amount?: number; amountType?: string } | undefined
      ),
      shippingDetails: normalizeCostType(
        details.shippingDetails as { cost?: number; costType?: string } | undefined
      ),
      discountEnabled: Boolean((details as Record<string, unknown>).discountEnabled),
      taxEnabled: Boolean((details as Record<string, unknown>).taxEnabled),
      shippingEnabled: Boolean((details as Record<string, unknown>).shippingEnabled),
      subTotal: Number(details.subTotal) ?? 0,
      totalAmount: Number(details.totalAmount) ?? 0,
      totalAmountInWords: String(details.totalAmountInWords ?? ""),
      includeTotalInWords: details.includeTotalInWords !== false,
      additionalNotes: String(details.additionalNotes ?? ""),
      paymentTerms: String(details.paymentTerms ?? ""),
      signature: details.signature as { data: string; fontFamily?: string } | undefined,
    },
  };
}
