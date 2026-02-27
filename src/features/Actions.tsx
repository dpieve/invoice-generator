import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ErrorDialog from "@/components/ErrorDialog";
import { useInvoice } from "@/context/InvoiceContext";
import { validateInvoice, translateValidationErrors } from "@/lib/schema";
import { readFileAsText } from "@/lib/helpers";
import type { InvoiceLanguage } from "@/types/invoice";
import i18n from "@/i18n";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Download,
  FileDown,
  RotateCcw,
  Upload,
} from "lucide-react";

interface ActionsProps {
  onGeneratePdf?: () => void;
}

const ACTION_BUTTON_CLASS =
  "h-auto min-h-11 text-base touch-manipulation sm:min-h-9 sm:text-sm flex-wrap whitespace-normal";

const LANGUAGE_OPTIONS: { value: InvoiceLanguage; labelKey: string }[] = [
  { value: "en", labelKey: "actions.languageEn" },
  { value: "pt-BR", labelKey: "actions.languagePtBR" },
];

export default function Actions({ onGeneratePdf }: ActionsProps) {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const {
    resetInvoice,
    getInvoiceJson,
    loadFromJson,
    invoice,
    updateDetails,
    updateInvoice,
  } = useInvoice();

  const handleLoadClick = () => fileInputRef.current?.click();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    try {
      const text = await readFileAsText(file);
      const result = loadFromJson(text);
      if (!result.success) {
        const msg = result.error ?? "errors.failedToLoad";
        setErrorMessage(msg.startsWith("errors.") ? t(msg) : msg);
      }
    } catch {
      setErrorMessage(t("errors.failedToLoad"));
    }
  };

  const handleSave = () => {
    const json = getInvoiceJson();
    const url = URL.createObjectURL(new Blob([json], { type: "application/json" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "invoice.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSetDatesToToday = () => {
    const today = new Date().toISOString().slice(0, 10);
    const due = new Date();
    due.setDate(due.getDate() + 30);
    updateDetails({ invoiceDate: today, dueDate: due.toISOString().slice(0, 10) });
  };

  const handleIncrementInvoiceNumber = () => {
    const num = parseInt(invoice.details.invoiceNumber, 10);
    if (!Number.isNaN(num)) updateDetails({ invoiceNumber: String(num + 1) });
  };

  const handleDecrementInvoiceNumber = () => {
    const num = parseInt(invoice.details.invoiceNumber, 10);
    if (!Number.isNaN(num) && num > 1) updateDetails({ invoiceNumber: String(num - 1) });
  };

  const handleGeneratePdf = () => {
    const result = validateInvoice(invoice);
    if (!result.success && result.errors?.length) {
      setErrorMessage(translateValidationErrors(result.errors, t));
      return;
    }
    onGeneratePdf?.();
  };

  const handleLanguageChange = (value: string) => {
    const lang = value as InvoiceLanguage;
    updateInvoice({ language: lang });
    i18n.changeLanguage(lang);
  };

  return (
    <div className="mb-10 min-w-0 w-full">
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        className="hidden"
        aria-hidden
        onChange={handleFileChange}
      />
      <h1 className="text-2xl font-bold md:text-2xl">{t("actions.title")}</h1>
      <h2 className="text-base text-muted-foreground mt-1">{t("actions.operations")}</h2>

      <div className="grid grid-cols-2 gap-3 mt-5 mb-5 sm:flex sm:flex-wrap items-center">
        <Button
          variant="outline"
          onClick={handleLoadClick}
          className={ACTION_BUTTON_CLASS}
        >
          <Upload className="mr-2 h-4 w-4 shrink-0" />
          <span className="truncate">{t("actions.load")}</span>
        </Button>
        <Button
          variant="outline"
          onClick={handleSave}
          className={ACTION_BUTTON_CLASS}
        >
          <Download className="mr-2 h-4 w-4 shrink-0" />
          <span className="truncate">{t("actions.save")}</span>
        </Button>
        <Button
          variant="destructive"
          onClick={resetInvoice}
          className={ACTION_BUTTON_CLASS}
        >
          <RotateCcw className="mr-2 h-4 w-4 shrink-0" />
          <span className="truncate">{t("actions.resetForm")}</span>
        </Button>
        <Button
          onClick={handleGeneratePdf}
          className={`${ACTION_BUTTON_CLASS} col-span-2 sm:col-span-1`}
        >
          <FileDown className="mr-2 h-4 w-4 shrink-0" />
          <span className="truncate">{t("actions.generatePdf")}</span>
        </Button>
        <div className="flex items-center gap-2 col-span-2 sm:col-span-1">
          <span className="text-sm text-muted-foreground shrink-0">{t("actions.language")}:</span>
          <Select
            value={invoice.language ?? "en"}
            onValueChange={handleLanguageChange}
          >
            <SelectTrigger className="min-h-11 w-full sm:w-[180px] sm:min-h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LANGUAGE_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {t(opt.labelKey)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card className="w-full min-w-0">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl">{t("actions.quickActions")}</CardTitle>
          <CardDescription className="text-base">
            {t("actions.quickActionsDesc")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:flex md:flex-wrap">
            <Button
              variant="outline"
              onClick={handleSetDatesToToday}
              className={`${ACTION_BUTTON_CLASS} w-full md:w-auto`}
            >
              <Calendar className="mr-2 h-4 w-4 shrink-0" />
              {t("actions.issueTodayDue30")}
            </Button>
            <Button
              variant="outline"
              onClick={handleDecrementInvoiceNumber}
              className={`${ACTION_BUTTON_CLASS} w-full md:w-auto`}
            >
              <ChevronLeft className="mr-1 h-4 w-4 shrink-0" />
              {t("actions.invoiceNumber")}
            </Button>
            <Button
              variant="outline"
              onClick={handleIncrementInvoiceNumber}
              className={`${ACTION_BUTTON_CLASS} w-full md:w-auto`}
            >
              {t("actions.invoiceNumber")}
              <ChevronRight className="ml-1 h-4 w-4 shrink-0" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <ErrorDialog
        open={errorMessage !== null}
        onOpenChange={(open) => !open && setErrorMessage(null)}
        title={t("actions.error")}
        message={errorMessage}
        closeLabel={t("actions.ok")}
      />
    </div>
  );
}
