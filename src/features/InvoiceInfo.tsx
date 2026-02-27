import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import FromAndTo from "./info/bills/FromAndTo";
import InvoiceDetails from "./info/details/InvoiceDetails";
import LineItems from "./info/items/LineItems";
import PaymentInfo from "./info/payment/PaymentInfo";
import Summary from "./info/summary/Summary";
import { ArrowLeft, ArrowRight } from "lucide-react";

const PAGE_KEYS = ["invoiceInfo.page1", "invoiceInfo.page2", "invoiceInfo.page3", "invoiceInfo.page4", "invoiceInfo.page5"] as const;

export default function InvoiceInfo() {
  const { t } = useTranslation();
  const [selectedPageIndex, setSelectedPageIndex] = useState(0);

  return (
    <>
      <div className="min-w-0 w-full">
        <div className="flex flex-wrap gap-2 mt-5 mb-10 md:flex-nowrap">
          {PAGE_KEYS.map((key, index) => (
            <Button
              key={key}
              variant={selectedPageIndex === index ? "default" : "outline"}
              onClick={() => setSelectedPageIndex(index)}
              className="min-h-10 shrink-0 px-3 text-sm touch-manipulation md:min-h-11 md:px-4 md:text-base"
            >
              {t(key)}
            </Button>
          ))}
        </div>

        <div className="w-full min-w-0">
          {selectedPageIndex === 0 && <FromAndTo />}
          {selectedPageIndex === 1 && <InvoiceDetails />}
          {selectedPageIndex === 2 && <LineItems />}
          {selectedPageIndex === 3 && <PaymentInfo />}
          {selectedPageIndex === 4 && <Summary />}
        </div>

        <div className="flex flex-wrap gap-3 mt-5 mb-10">
          {selectedPageIndex > 0 && (
            <Button
              onClick={() => setSelectedPageIndex(selectedPageIndex - 1)}
              className="min-h-11 flex-1 sm:flex-none text-base touch-manipulation"
            >
              <ArrowLeft className="ml-2 h-4 w-4 shrink-0" />
              {t("invoiceInfo.back")}
            </Button>
          )}
          <Button
            disabled={selectedPageIndex === PAGE_KEYS.length - 1}
            onClick={() => setSelectedPageIndex(selectedPageIndex + 1)}
            className="min-h-11 flex-1 sm:flex-none text-base touch-manipulation"
          >
            {t("invoiceInfo.next")}
            <ArrowRight className="ml-2 h-4 w-4 shrink-0" />
          </Button>
        </div>
      </div>
    </>
  )
}