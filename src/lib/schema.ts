import { z } from "zod";

const optionalString = z.string().optional();
const requiredString = z.string().min(1, "validation.required");

export const invoiceSchema = z.object({
  language: z.enum(["en", "pt-BR"]).optional(),
  sender: z.object({
    name: requiredString,
    address: optionalString,
    zipCode: optionalString,
    city: optionalString,
    country: optionalString,
    email: z.string().email("validation.invalidEmail").optional().or(z.literal("")),
    phone: optionalString,
  }),
  receiver: z.object({
    name: requiredString,
    address: optionalString,
    zipCode: optionalString,
    city: optionalString,
    country: optionalString,
    email: z.string().email("validation.invalidEmail").optional().or(z.literal("")),
    phone: optionalString,
  }),
  details: z.object({
    invoiceNumber: requiredString,
    invoiceDate: z.string().min(1, "validation.issueDateRequired"),
    dueDate: z.string().min(1, "validation.dueDateRequired"),
    currency: requiredString,
    paymentTerms: requiredString,
    items: z
      .array(
        z.object({
          id: z.string(),
          name: z.string(),
          description: z.string().optional(),
          quantity: z.number().min(0),
          unitPrice: z.number().min(0),
          total: z.number(),
        })
      )
      .min(1, "validation.atLeastOneItem")
      .refine(
        (items) =>
          items.some(
            (item) =>
              Number(item.quantity) > 0 && Number(item.unitPrice) >= 0
          ),
        "validation.atLeastOneItemWithQuantity"
      ),
  }),
});

export type InvoiceSchemaType = z.infer<typeof invoiceSchema>;

export function validateInvoice(data: unknown): {
  success: boolean;
  errors?: string[];
} {
  const result = invoiceSchema.safeParse(data);
  if (result.success) {
    return { success: true };
  }
  const errors = result.error.issues.map(
    (i) => `${i.path.join(".") || "form"}: ${i.message}`
  );
  return { success: false, errors };
}

export function translateValidationErrors(
  errors: string[],
  t: (key: string) => string
): string {
  return errors
    .map((err) => {
      const idx = err.indexOf(": ");
      if (idx === -1) return err.startsWith("validation.") ? t(err) : err;
      const path = err.slice(0, idx);
      const key = err.slice(idx + 2);
      return `${path}: ${key.startsWith("validation.") ? t(key) : key}`;
    })
    .join("\n");
}
