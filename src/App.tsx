import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { useReactToPrint } from "react-to-print";
import Actions from "./features/Actions";
import InvoiceInfo from "./features/InvoiceInfo";
import InvoicePreview from "./features/InvoicePreview";
import { InvoiceProvider, useInvoice } from "./context/InvoiceContext";

const PRINT_PAGE_STYLE = `
  @page { size: A4; margin: 0; }
  @media print {
    html, body {
      margin: 0 !important;
      padding: 0 !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      width: 100% !important;
      min-height: 100% !important;
    }
    .print-invoice-root {
      width: 100% !important;
      max-width: none !important;
      margin: 0 !important;
      padding: 0 !important;
    }
    .print-invoice-root section {
      width: 100% !important;
      max-width: none !important;
      margin: 0 !important;
      padding: 2mm 0 !important;
      min-height: auto !important;
      box-shadow: none !important;
    }
    .invoice-single-page { max-height: none !important; }
  }
`;

function InvoiceApp() {
  const { t } = useTranslation();
  const printRef = useRef<HTMLDivElement>(null);
  const { invoice } = useInvoice();
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: "",
    pageStyle: PRINT_PAGE_STYLE,
  });

  return (
    <div className="min-h-screen w-full bg-[#f5f5f5] py-6 px-4 md:px-6 print:bg-white print:py-0 print:px-0">
      <div className="mx-auto w-full max-w-4xl rounded-xl bg-white shadow-sm px-4 py-6 md:p-8 print:shadow-none print:rounded-none print:max-w-none print:my-0 print:mx-0 print:p-0 print-invoice-app-content">
        <header className="mb-6">
          <h1 className="text-2xl font-bold md:text-2xl">{t("app.invoiceTitle")}{invoice.details.invoiceNumber || "1"}</h1>
          <p className="text-base text-muted-foreground mt-1">{t("app.generateInvoice")}</p>
        </header>
        <Actions onGeneratePdf={handlePrint} />
        <InvoiceInfo />
        <InvoicePreview ref={printRef} onGeneratePdf={handlePrint} />
      </div>
    </div>
  );
}

function App() {
  return (
    <InvoiceProvider>
      <InvoiceApp />
    </InvoiceProvider>
  );
}

export default App;
