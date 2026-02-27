import { forwardRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import InvoiceDocument from "@/components/InvoiceDocument";
import ErrorDialog from "@/components/ErrorDialog";
import { useInvoice } from "@/context/InvoiceContext";
import { validateInvoice, translateValidationErrors } from "@/lib/schema";
import { Download } from "lucide-react";

interface InvoicePreviewProps {
  onGeneratePdf?: () => void;
}

const InvoicePreview = forwardRef<HTMLDivElement, InvoicePreviewProps>(
  function InvoicePreview({ onGeneratePdf }, ref) {
    const { t } = useTranslation();
    const { invoice } = useInvoice();
    const [validationError, setValidationError] = useState<string | null>(null);

    const handleGeneratePdf = () => {
      const result = validateInvoice(invoice);
      if (!result.success && result.errors?.length) {
        setValidationError(translateValidationErrors(result.errors, t));
        return;
      }
      setValidationError(null);
      onGeneratePdf?.();
    };

    return (
      <div className="min-w-0 w-full">
        <div className="flex items-center gap-2 mb-5">
          <h2 className="text-2xl font-bold">{t("preview.livePreview")}</h2>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleGeneratePdf}
            title={t("preview.generatePdf")}
            className="shrink-0"
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
        <Card className="p-4 overflow-auto max-h-[75vh] md:max-h-[80vh] w-full min-w-0">
          <div ref={ref} className="print-invoice-root w-full min-w-0 print:min-w-0 md:min-w-[600px]">
            <InvoiceDocument invoice={invoice} />
          </div>
        </Card>

        <ErrorDialog
          open={validationError !== null}
          onOpenChange={(open) => !open && setValidationError(null)}
          title={t("preview.validationError")}
          message={validationError}
          closeLabel={t("preview.ok")}
        />
      </div>
    );
  }
);

export default InvoicePreview;
