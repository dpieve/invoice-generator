import numberToWords from "number-to-words";
import type { InvoiceLanguage } from "@/types/invoice";

export function formatNumberWithCommas(num: number, locale: string = "en-US"): string {
  return num.toLocaleString(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function isDataUrl(str: string): boolean {
  return str.startsWith("data:");
}

export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("File read failed"));
    reader.readAsText(file);
  });
}

export function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("File read failed"));
    reader.readAsDataURL(file);
  });
}

export const DATE_OPTIONS: Intl.DateTimeFormatOptions = {
  year: "numeric",
  month: "long",
  day: "numeric",
};

export function formatDate(dateStr: string, locale: string): string {
  const d = new Date(dateStr);
  return Number.isNaN(d.getTime()) ? dateStr : d.toLocaleDateString(locale, DATE_OPTIONS);
}

const PT_UNITS = ["zero", "um", "dois", "três", "quatro", "cinco", "seis", "sete", "oito", "nove"];
const PT_TEENS = ["dez", "onze", "doze", "treze", "catorze", "quinze", "dezesseis", "dezessete", "dezoito", "dezenove"];
const PT_TENS = ["", "", "vinte", "trinta", "quarenta", "cinquenta", "sessenta", "setenta", "oitenta", "noventa"];
const PT_HUNDREDS = ["", "cento", "duzentos", "trezentos", "quatrocentos", "quinhentos", "seiscentos", "setecentos", "oitocentos", "novecentos"];

function numberToWordsPtBR(n: number): string {
  if (n === 0) return "zero";
  if (n < 0 || n > 999999999.99) return String(n);
  let s = "";
  const int = Math.floor(n);
  if (int >= 1000000) {
    const millions = Math.floor(int / 1000000);
    s += millions === 1 ? "um milhão" : numberToWordsPtBR(millions) + " milhões";
    const rest = int % 1000000;
    return rest ? (s + " " + numberToWordsPtBR(rest)).trim() : s.trim();
  }
  if (int >= 1000) {
    const thousands = Math.floor(int / 1000);
    s += thousands === 1 ? "mil" : numberToWordsPtBR(thousands) + " mil";
    const rest = int % 1000;
    return rest ? (s + " " + numberToWordsPtBR(rest)).trim() : s.trim();
  }
  if (int >= 100) {
    const h = Math.floor(int / 100);
    if (h === 1 && int % 100 === 0) return "cem";
    s += PT_HUNDREDS[h];
    if (int % 100) s += " e ";
    return (s + numberToWordsPtBR(int % 100)).trim();
  }
  if (int >= 20) {
    const t = Math.floor(int / 10);
    s += PT_TENS[t];
    if (int % 10) s += " e " + PT_UNITS[int % 10];
    return s;
  }
  if (int >= 10) return PT_TEENS[int - 10];
  return PT_UNITS[int];
}

/**
 * Convert a price to words for invoice total (e.g. "Nine thousand, one hundred fifty Dollar USD").
 * Supports English and Portuguese (Brazilian).
 */
export function formatTotalInWords(
  price: number,
  currency: string,
  language?: InvoiceLanguage
): string {
  const rounded = Math.round(price * 100) / 100;
  const integerPart = Math.floor(rounded);
  const fractionalPart = Math.round((rounded - integerPart) * 100);
  const isPtBR = language === "pt-BR";

  if (integerPart === 0 && fractionalPart === 0) {
    return `Zero ${currency}`;
  }

  if (isPtBR) {
    const intWords = numberToWordsPtBR(integerPart);
    const cap = intWords.charAt(0).toUpperCase() + intWords.slice(1);
    let result = cap + " " + currency;
    if (fractionalPart > 0) {
      const fracWords = numberToWordsPtBR(fractionalPart);
      result += " e " + fracWords + " centavos";
    }
    return result;
  }

  const integerWords = numberToWords
    .toWords(integerPart)
    .replace(/^\w/, (c: string) => c.toUpperCase());
  let result = integerWords + " " + currency;
  if (fractionalPart > 0) {
    const fracWords = numberToWords.toWords(fractionalPart);
    result += " and " + fracWords + " cents";
  }
  return result;
}
