import { useTranslation } from "react-i18next";
import { useInvoice } from "@/context/InvoiceContext";
import BillForm from "./BillForm";

export default function FromAndTo() {
  const { t } = useTranslation();
  const { invoice, updateSender, updateReceiver } = useInvoice();

  return (
    <div className="flex flex-col md:flex-row gap-10 md:gap-16">
      <BillForm
        title={t("billForm.billFrom")}
        data={invoice.sender}
        onUpdate={updateSender}
        fromPlaceholders
      />
      <BillForm
        title={t("billForm.billTo")}
        data={invoice.receiver}
        onUpdate={updateReceiver}
      />
    </div>
  );
}
