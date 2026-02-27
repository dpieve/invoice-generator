import type { Invoice } from "@/types/invoice";
import { formatTotalInWords } from "@/lib/helpers";

export function computeItemTotal(quantity: number, unitPrice: number): number {
  return Math.round(quantity * unitPrice * 100) / 100;
}

export function computeSubTotal(items: Invoice["details"]["items"]): number {
  return items.reduce((sum, item) => sum + computeItemTotal(item.quantity, item.unitPrice), 0);
}

function applyCharge(
  subTotal: number,
  value: number,
  type: "amount" | "percentage"
): number {
  if (type === "percentage") {
    return Math.round((subTotal * (value / 100)) * 100) / 100;
  }
  return value;
}

export function computeTotalAmount(invoice: Invoice): number {
  const { details } = invoice;
  let total = computeSubTotal(details.items);
  if (details.discountEnabled && details.discountDetails) {
    const discount = details.discountDetails.amount ?? 0;
    if (discount) {
      total -= applyCharge(total, discount, details.discountDetails.amountType);
    }
  }
  if (details.taxEnabled && details.taxDetails) {
    const tax = details.taxDetails.amount ?? 0;
    if (tax) {
      total += applyCharge(total, tax, details.taxDetails.amountType);
    }
  }
  if (details.shippingEnabled && details.shippingDetails) {
    const shipping = details.shippingDetails.cost ?? 0;
    if (shipping) {
      total += applyCharge(total, shipping, details.shippingDetails.costType);
    }
  }
  return Math.round(total * 100) / 100;
}

export function getInvoiceWithComputedTotals(invoice: Invoice): Invoice {
  const subTotal = computeSubTotal(invoice.details.items);
  const totalAmount = computeTotalAmount(invoice);
  const totalAmountInWords = invoice.details.includeTotalInWords
    ? formatTotalInWords(totalAmount, invoice.details.currency, invoice.language ?? "en")
    : "";
  return {
    ...invoice,
    details: {
      ...invoice.details,
      subTotal,
      totalAmount,
      totalAmountInWords,
      items: invoice.details.items.map((item) => ({
        ...item,
        total: computeItemTotal(item.quantity, item.unitPrice),
      })),
    },
  };
}
