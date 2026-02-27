import { useTranslation } from "react-i18next";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useInvoice } from "@/context/InvoiceContext";

export default function PaymentInfo() {
  const { t } = useTranslation();
  const { invoice, updateDetails } = useInvoice();
  const payment = invoice.details.paymentInformation ?? {
    bankName: "",
    accountName: "",
    accountNumber: "",
  };

  const setPayment = (partial: Partial<typeof payment>) => {
    updateDetails({
      paymentInformation: { ...payment, ...partial },
    });
  };

  return (
    <div className="space-y-5">
      <h2 className="text-xl font-bold">{t("paymentInfo.title")}</h2>

      <Field>
        <Label>{t("paymentInfo.bankName")}</Label>
        <Input
          placeholder={t("paymentInfo.placeholderBankName")}
          value={payment.bankName}
          onChange={(e) => setPayment({ bankName: e.target.value })}
        />
      </Field>

      <Field>
        <Label>{t("paymentInfo.accountName")}</Label>
        <Input
          placeholder={t("paymentInfo.placeholderAccountName")}
          value={payment.accountName}
          onChange={(e) => setPayment({ accountName: e.target.value })}
        />
      </Field>

      <Field>
        <Label>{t("paymentInfo.accountNumber")}</Label>
        <Input
          placeholder={t("paymentInfo.placeholderAccountNumber")}
          value={payment.accountNumber}
          onChange={(e) => setPayment({ accountNumber: e.target.value })}
        />
      </Field>
    </div>
  );
}
