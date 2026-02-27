import { useTranslation } from "react-i18next";
import { Field } from "@/components/ui/field";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useInvoice } from "@/context/InvoiceContext";
import { computeSubTotal, computeTotalAmount } from "@/lib/calculations";
import { formatTotalInWords, formatNumberWithCommas, readFileAsDataURL } from "@/lib/helpers";
import ImageUploadField from "@/components/ImageUploadField";
import SummaryAdjustmentRow from "./SummaryAdjustmentRow";

export default function Summary() {
  const { t } = useTranslation();
  const { invoice, updateDetails } = useInvoice();
  const { details } = invoice;
  const currency = details.currency;
  const locale = invoice.language === "pt-BR" ? "pt-BR" : "en-US";

  const subTotal = computeSubTotal(details.items);
  const totalAmount = computeTotalAmount(invoice);

  const handleSignatureSelect = async (file: File) => {
    const data = await readFileAsDataURL(file);
    updateDetails({ signature: { data } });
  };

  return (
    <div className="space-y-5">
      <h2 className="text-xl font-bold">{t("summary.title")}</h2>

      <ImageUploadField
        value={details.signature?.data}
        onSelect={handleSignatureSelect}
        onRemove={() => updateDetails({ signature: undefined })}
        label={t("summary.signature")}
        uploadPlaceholder={t("summary.clickToAddSignature")}
        removeAriaLabel={t("summary.removeSignature")}
        imageAlt={t("summary.signatureAlt")}
        inputId="signature-upload"
      />

      <Field>
        <Label>{t("summary.additionalNotes")}</Label>
        <Textarea
          placeholder={t("summary.placeholderNotes")}
          value={details.additionalNotes}
          onChange={(e) => updateDetails({ additionalNotes: e.target.value })}
        />
      </Field>

      <Field>
        <Label>{t("summary.paymentTerms")}</Label>
        <Textarea
          placeholder={t("summary.placeholderTerms")}
          value={details.paymentTerms}
          onChange={(e) => updateDetails({ paymentTerms: e.target.value })}
        />
      </Field>

      <div className="space-y-3 min-w-[20rem] max-w-md">
        <div className="flex justify-between items-center gap-4">
          <Label className="shrink-0">{t("summary.subtotal")}</Label>
          <span className="tabular-nums text-right min-w-[8rem]">
            {formatNumberWithCommas(subTotal, locale)} {currency}
          </span>
        </div>

        <SummaryAdjustmentRow
          label={t("summary.discount")}
          enabled={details.discountEnabled}
          onEnabledChange={(p) =>
            updateDetails({
              discountEnabled: p,
              discountDetails: p
                ? details.discountDetails ?? { amount: 0, amountType: "amount" }
                : details.discountDetails,
            })
          }
          value={details.discountDetails?.amount ?? 0}
          onValueChange={(amount) =>
            details.discountDetails &&
            updateDetails({
              discountDetails: { ...details.discountDetails, amount },
            })
          }
          amountType={details.discountDetails?.amountType ?? "amount"}
          onTypeToggle={() =>
            details.discountDetails &&
            updateDetails({
              discountDetails: {
                ...details.discountDetails,
                amountType:
                  details.discountDetails.amountType === "amount" ? "percentage" : "amount",
              },
            })
          }
          currency={currency}
          toggleAriaLabel={t("summary.ariaToggleDiscount")}
        />

        <SummaryAdjustmentRow
          label={t("summary.tax")}
          enabled={details.taxEnabled}
          onEnabledChange={(p) =>
            updateDetails({
              taxEnabled: p,
              taxDetails: p
                ? details.taxDetails ?? { amount: 0, amountType: "amount" }
                : details.taxDetails,
            })
          }
          value={details.taxDetails?.amount ?? 0}
          onValueChange={(amount) =>
            details.taxDetails &&
            updateDetails({
              taxDetails: { ...details.taxDetails, amount },
            })
          }
          amountType={details.taxDetails?.amountType ?? "amount"}
          onTypeToggle={() =>
            details.taxDetails &&
            updateDetails({
              taxDetails: {
                ...details.taxDetails,
                amountType:
                  details.taxDetails.amountType === "amount" ? "percentage" : "amount",
              },
            })
          }
          currency={currency}
          toggleAriaLabel={t("summary.ariaToggleTax")}
        />

        <SummaryAdjustmentRow
          label={t("summary.shipping")}
          enabled={details.shippingEnabled}
          onEnabledChange={(p) =>
            updateDetails({
              shippingEnabled: p,
              shippingDetails: p
                ? details.shippingDetails ?? { cost: 0, costType: "amount" }
                : details.shippingDetails,
            })
          }
          value={details.shippingDetails?.cost ?? 0}
          onValueChange={(cost) =>
            details.shippingDetails &&
            updateDetails({
              shippingDetails: { ...details.shippingDetails, cost },
            })
          }
          amountType={details.shippingDetails?.costType ?? "amount"}
          onTypeToggle={() =>
            details.shippingDetails &&
            updateDetails({
              shippingDetails: {
                ...details.shippingDetails,
                costType:
                  details.shippingDetails.costType === "amount" ? "percentage" : "amount",
              },
            })
          }
          currency={currency}
          toggleAriaLabel={t("summary.ariaToggleShipping")}
        />

        <div className="flex justify-between items-center gap-4">
          <Label className="shrink-0">{t("summary.includeTotalInWords")}</Label>
          <div className="flex justify-end min-w-[8rem]">
            <Switch
              checked={details.includeTotalInWords}
              onCheckedChange={(p) => updateDetails({ includeTotalInWords: p })}
            />
          </div>
        </div>

        <div className="flex justify-between items-center gap-4 font-semibold pt-2 border-t border-border">
          <Label className="shrink-0">{t("summary.totalAmount")}</Label>
          <span className="tabular-nums text-right min-w-[8rem]">
            {formatNumberWithCommas(totalAmount, locale)} {currency}
          </span>
        </div>

        {details.includeTotalInWords && (
          <div className="pt-2 text-sm">
            <Label>{t("summary.totalInWords")}</Label>
            <p className="text-muted-foreground italic mt-1">
              {formatTotalInWords(totalAmount, currency, invoice.language)}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
