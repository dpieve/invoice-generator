import { useTranslation } from "react-i18next";
import type { Invoice } from "@/types/invoice";
import { getInvoiceWithComputedTotals } from "@/lib/calculations";
import { formatNumberWithCommas, isDataUrl, formatDate } from "@/lib/helpers";

interface InvoiceDocumentProps {
  invoice: Invoice;
}

export default function InvoiceDocument({ invoice }: InvoiceDocumentProps) {
  const { t } = useTranslation();
  const data = getInvoiceWithComputedTotals(invoice);
  const { sender, receiver, details } = data;
  const locale = data.language === "pt-BR" ? "pt-BR" : "en-US";

  const hasSenderAddress =
    sender.address || sender.zipCode || sender.city || sender.country;
  const hasReceiverAddress =
    receiver.address || receiver.zipCode || receiver.city || receiver.country;
  const senderCustomInputs = sender.customInputs?.filter(
    (c) => c.key.trim() || c.value.trim()
  );
  const receiverCustomInputs = receiver.customInputs?.filter(
    (c) => c.key.trim() || c.value.trim()
  );

  return (
    <section
      className="invoice-single-page flex flex-col p-4 bg-white rounded-xl text-gray-800 font-sans text-sm print:text-[11pt] print:p-0 print:rounded-none print:min-h-0 print:shadow-none"
      style={{ fontFamily: "Outfit, sans-serif" }}
    >
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 print:gap-1">
        <div className="min-w-0 flex sm:block sm:flex-none">
          {details.invoiceLogo && (
            <img
              src={details.invoiceLogo}
              width={140}
              height={100}
              alt={`Logo of ${sender.name}`}
              className="object-contain w-[140px] h-[100px] shrink-0"
            />
          )}
        </div>
        <div className="text-right min-w-0 mt-2 sm:mt-0 sm:flex sm:flex-col sm:items-end">
          <div className="flex flex-col sm:items-end">
            <h2 className="text-2xl font-semibold text-gray-800 print:text-[24pt] leading-tight">
              {t("document.invoiceNumber")}
            </h2>
            <span className="mt-0.5 block text-gray-500 text-xs print:text-[11pt]">
              {details.invoiceNumber}
            </span>
          </div>
          <div className="mt-4 print:mt-3">
            <h1 className="text-lg font-semibold text-blue-600 print:text-[18pt]">
              {sender.name || "—"}
            </h1>
            {hasSenderAddress && (
              <address className="mt-1 not-italic text-gray-800 text-xs leading-snug print:text-[10pt]">
                {sender.address && <>{sender.address}<br /></>}
                {[sender.zipCode, sender.city, sender.country].filter(Boolean).join(", ")}
              </address>
            )}
            {senderCustomInputs && senderCustomInputs.length > 0 && (
              <div className="mt-1 space-y-0.5 text-xs text-gray-800 print:text-[10pt]">
                {senderCustomInputs.map((c, i) => (
                  <div key={i}>
                    {c.key && <span className="font-medium">{c.key}: </span>}
                    {c.value}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4 print:mt-5 items-start">
        <div>
          <h3 className="text-xs font-semibold text-gray-800 tracking-wide print:text-[11pt]">
            {t("document.billTo")}
          </h3>
          <p className="mt-0.5 font-semibold text-gray-800 text-sm print:text-[14pt]">
            {receiver.name || "—"}
          </p>
          {hasReceiverAddress && (
            <address className="mt-0.5 not-italic text-gray-500 text-xs leading-snug print:text-[10pt]">
              {receiver.address && <>{receiver.address}<br /></>}
              {[receiver.zipCode, receiver.city, receiver.country].filter(Boolean).join(", ")}
            </address>
          )}
          {receiverCustomInputs && receiverCustomInputs.length > 0 && (
            <div className="mt-0.5 space-y-0.5 text-xs text-gray-500 print:text-[10pt]">
              {receiverCustomInputs.map((c, i) => (
                <div key={i}>
                  {c.key && <span className="font-medium text-gray-800">{c.key}: </span>}
                  {c.value}
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="text-right sm:text-right space-y-1 print:text-[11pt]">
          <dl className="space-y-1 text-xs text-gray-800 print:text-[10pt]">
            <div className="flex justify-end gap-3">
              <dt className="font-semibold text-gray-800">{t("document.invoiceDate")}</dt>
              <dd className="text-gray-500 min-w-[7rem]">{formatDate(details.invoiceDate, locale)}</dd>
            </div>
            <div className="flex justify-end gap-3">
              <dt className="font-semibold text-gray-800">{t("document.dueDate")}</dt>
              <dd className="text-gray-500 min-w-[7rem]">{formatDate(details.dueDate, locale)}</dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="mt-5 border border-gray-200 rounded overflow-hidden print:mt-5">
        <div className="grid grid-cols-5 gap-1 px-3 py-2 bg-gray-50 text-[10px] font-medium text-gray-500 uppercase print:text-[9pt]">
          <div className="col-span-2">{t("document.item")}</div>
          <div className="text-center">{t("document.qty")}</div>
          <div className="text-right">{t("document.rate")}</div>
          <div className="text-right">{t("document.amount")}</div>
        </div>
        <div className="border-t border-gray-200" />
        {details.items.map((item) => (
          <div
            key={item.id}
            className="grid grid-cols-5 gap-1 px-3 py-3 border-t border-gray-100 print:py-2.5 print:text-[11pt]"
          >
            <div className="col-span-2 min-w-0">
              <p className="font-medium text-gray-800 text-xs break-words print:text-[11pt]">
                {item.name || "—"}
              </p>
              {item.description && (
                <p className="text-[10px] text-gray-600 whitespace-pre-line mt-1 print:text-[9pt]">
                  {item.description}
                </p>
              )}
            </div>
            <div className="text-gray-800 text-center text-xs print:text-[11pt] flex items-center justify-center">
              {item.quantity}
            </div>
            <div className="text-gray-800 text-right text-xs print:text-[11pt] flex items-center justify-end">
              {item.unitPrice} {details.currency}
            </div>
            <div className="text-right font-medium text-gray-800 text-xs print:text-[11pt] flex items-center justify-end">
              {(item.quantity * item.unitPrice).toFixed(2)} {details.currency}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex justify-end print:mt-4">
        <div className="text-right space-y-0.5 min-w-[180px] print:min-w-[160px] print:text-[11pt]">
          <div className="flex justify-between gap-4">
            <span className="font-semibold text-gray-800">{t("document.subtotal")}</span>
            <span className="text-gray-700">
              {formatNumberWithCommas(details.subTotal, locale)} {details.currency}
            </span>
          </div>
          {details.discountEnabled && details.discountDetails && details.discountDetails.amount > 0 && (
            <div className="flex justify-between gap-4">
              <span className="font-semibold text-gray-800">{t("document.discount")}</span>
              <span className="text-gray-700">
                - {details.discountDetails.amountType === "percentage"
                  ? `${details.discountDetails.amount}%`
                  : `${details.discountDetails.amount} ${details.currency}`}
              </span>
            </div>
          )}
          {details.taxEnabled && details.taxDetails && details.taxDetails.amount > 0 && (
            <div className="flex justify-between gap-4">
              <span className="font-semibold text-gray-800">{t("document.tax")}</span>
              <span className="text-gray-700">
                + {details.taxDetails.amountType === "percentage"
                  ? `${details.taxDetails.amount}%`
                  : `${details.taxDetails.amount} ${details.currency}`}
              </span>
            </div>
          )}
          {details.shippingEnabled && details.shippingDetails && details.shippingDetails.cost > 0 && (
            <div className="flex justify-between gap-4">
              <span className="font-semibold text-gray-800">{t("document.shipping")}</span>
              <span className="text-gray-700">
                + {details.shippingDetails.costType === "percentage"
                  ? `${details.shippingDetails.cost}%`
                  : `${details.shippingDetails.cost} ${details.currency}`}
              </span>
            </div>
          )}
          <div className="flex justify-between gap-4 font-semibold pt-1 border-t border-gray-200">
            <span className="text-gray-800">{t("document.total")}</span>
            <span className="text-gray-800">
              {formatNumberWithCommas(details.totalAmount, locale)} {details.currency}
            </span>
          </div>
          {details.includeTotalInWords && details.totalAmountInWords && (
            <div className="flex flex-col items-end pt-0.5">
              <span className="font-semibold text-gray-800 text-[10px] print:text-[10pt]">
                {t("document.totalInWords")}
              </span>
              <em className="text-gray-500 text-[10px] italic print:text-[10pt]">
                {details.totalAmountInWords}
              </em>
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 space-y-4 print:mt-4 print:space-y-4">
        {details.additionalNotes && (
          <div>
            <p className="font-semibold text-blue-600 text-xs print:text-[11pt]">
              {t("document.additionalNotes")}
            </p>
            <p className="mt-0.5 text-gray-800 text-xs print:text-[11pt]">
              {details.additionalNotes}
            </p>
          </div>
        )}
        {details.paymentTerms && (
          <div>
            <p className="font-semibold text-blue-600 text-xs print:text-[11pt]">
              {t("document.paymentTerms")}
            </p>
            <p className="mt-0.5 text-gray-800 text-xs print:text-[11pt]">
              {details.paymentTerms}
            </p>
          </div>
        )}
        {details.paymentInformation &&
          (details.paymentInformation.bankName ||
            details.paymentInformation.accountName ||
            details.paymentInformation.accountNumber) && (
            <div>
              <p className="font-semibold text-gray-800 text-xs print:text-[11pt]">
                {t("document.sendPaymentToAccount")}
              </p>
              <p className="mt-0.5 text-gray-700 text-[10px] print:text-[10pt]">
                {t("document.bank")} {details.paymentInformation.bankName}
              </p>
              <p className="text-gray-700 text-[10px] print:text-[10pt]">
                {t("document.accountName")} {details.paymentInformation.accountName}
              </p>
              <p className="text-gray-700 text-[10px] print:text-[10pt]">
                {t("document.accountNo")} {details.paymentInformation.accountNumber}
              </p>
            </div>
          )}
        <div>
          <p className="text-gray-500 text-[10px] print:text-[9pt]">
            {t("document.contactSentence")}
          </p>
          <div className="mt-0.5 text-[10px] text-gray-800 print:text-[10pt]">
            {sender.email && <p className="font-medium">{sender.email}</p>}
            {sender.phone && <p className="font-medium">{sender.phone}</p>}
          </div>
        </div>
      </div>

      {details.signature?.data && (
        <div className="mt-5 print:mt-5">
          <p className="font-semibold text-gray-800 text-xs print:text-[11pt]">
            {t("document.signature")}
          </p>
          {isDataUrl(details.signature.data) ? (
            <img
              src={details.signature.data}
              width={100}
              height={50}
              alt={`Signature of ${sender.name}`}
              className="object-contain print:h-12"
            />
          ) : (
            <p
              style={{
                fontSize: "1.25rem",
                fontWeight: 400,
                fontFamily: details.signature.fontFamily
                  ? `${details.signature.fontFamily}, cursive`
                  : "cursive",
                color: "black",
              }}
            >
              {details.signature.data}
            </p>
          )}
        </div>
      )}
    </section>
  );
}
