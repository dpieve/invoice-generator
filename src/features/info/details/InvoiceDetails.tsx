import { useTranslation } from "react-i18next";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useInvoice } from "@/context/InvoiceContext";
import { readFileAsDataURL } from "@/lib/helpers";
import ImageUploadField from "@/components/ImageUploadField";

const CURRENCY_KEYS = ["currencyUSD", "currencyEUR", "currencyGBP", "currencyBRL"] as const;
const CURRENCY_VALUES = ["USD", "EUR", "GBP", "BRL"] as const;

export default function InvoiceDetails() {
  const { t } = useTranslation();
  const { invoice, updateDetails } = useInvoice();
  const { details } = invoice;

  const handleLogoSelect = async (file: File) => {
    const data = await readFileAsDataURL(file);
    updateDetails({ invoiceLogo: data });
  };

  return (
    <div className="space-y-5">
      <h2 className="text-xl font-bold">{t("invoiceDetails.title")}</h2>

      <ImageUploadField
        value={details.invoiceLogo || undefined}
        onSelect={handleLogoSelect}
        onRemove={() => updateDetails({ invoiceLogo: "" })}
        label={t("invoiceDetails.invoiceLogo")}
        uploadPlaceholder={t("invoiceDetails.clickToUploadImage")}
        removeAriaLabel={t("invoiceDetails.removeLogo")}
        imageAlt={t("invoiceDetails.invoiceLogoAlt")}
        imageClassName="h-24 w-auto max-w-[140px] object-contain border border-gray-200 rounded-md"
        inputId="invoice-logo-upload"
        changeButtonLabel={t("invoiceDetails.change")}
      />

      <Field orientation="horizontal" className="items-center gap-2">
        <Label className="min-w-[7rem]">{t("invoiceDetails.invoiceNumber")}</Label>
        <Input
          className="max-w-sm"
          placeholder={t("invoiceDetails.placeholderInvoiceNumber")}
          value={details.invoiceNumber}
          onChange={(e) => updateDetails({ invoiceNumber: e.target.value })}
        />
      </Field>

      <Field orientation="horizontal" className="items-center gap-2">
        <Label className="min-w-[7rem]">{t("invoiceDetails.issueDate")}</Label>
        <Input
          type="date"
          className="max-w-sm"
          value={details.invoiceDate}
          onChange={(e) => updateDetails({ invoiceDate: e.target.value })}
        />
      </Field>

      <Field orientation="horizontal" className="items-center gap-2">
        <Label className="min-w-[7rem]">{t("invoiceDetails.dueDate")}</Label>
        <Input
          type="date"
          className="max-w-sm"
          value={details.dueDate}
          onChange={(e) => updateDetails({ dueDate: e.target.value })}
        />
      </Field>

      <Field orientation="horizontal" className="items-center gap-2">
        <Label className="min-w-[7rem]">{t("invoiceDetails.currency")}</Label>
        <Select
          value={details.currency}
          onValueChange={(value) => updateDetails({ currency: value })}
        >
          <SelectTrigger className="max-w-sm">
            <SelectValue placeholder={t("invoiceDetails.selectCurrency")} />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>{t("invoiceDetails.currencyLabel")}</SelectLabel>
              {CURRENCY_KEYS.map((key, i) => (
                <SelectItem key={CURRENCY_VALUES[i]} value={CURRENCY_VALUES[i]}>
                  {t(`invoiceDetails.${key}`)}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </Field>
    </div>
  );
}
