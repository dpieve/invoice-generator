export interface CustomInput {
  key: string;
  value: string;
}

export interface SenderReceiver {
  name: string;
  address: string;
  zipCode: string;
  city: string;
  country: string;
  email: string;
  phone: string;
  customInputs?: CustomInput[];
}

export interface LineItem {
  id: string;
  name: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface PaymentInformation {
  bankName: string;
  accountName: string;
  accountNumber: string;
}

export interface DiscountDetails {
  amount: number;
  amountType: "amount" | "percentage";
}

export interface TaxDetails {
  amount: number;
  amountType: "amount" | "percentage";
}

export interface ShippingDetails {
  cost: number;
  costType: "amount" | "percentage";
}

export interface Signature {
  data: string;
  fontFamily?: string;
}

export interface InvoiceDetails {
  invoiceLogo: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  currency: string;
  items: LineItem[];
  paymentInformation?: PaymentInformation;
  discountDetails?: DiscountDetails;
  taxDetails?: TaxDetails;
  shippingDetails?: ShippingDetails;
  discountEnabled: boolean;
  taxEnabled: boolean;
  shippingEnabled: boolean;
  subTotal: number;
  totalAmount: number;
  totalAmountInWords: string;
  includeTotalInWords: boolean;
  additionalNotes: string;
  paymentTerms: string;
  signature?: Signature;
}

export type InvoiceLanguage = "en" | "pt-BR";

export interface Invoice {
  sender: SenderReceiver;
  receiver: SenderReceiver;
  details: InvoiceDetails;
  language?: InvoiceLanguage;
}
