import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import type { Invoice } from "@/types/invoice";
import { getDefaultInvoice } from "@/lib/defaults";
import { getInvoiceWithComputedTotals } from "@/lib/calculations";
import { parseInvoiceFromObject } from "@/lib/parseInvoiceJson";
import i18n from "@/i18n";

interface SaveResult {
  success: boolean;
  fileName?: string;
  cancelled?: boolean;
  error?: string;
}

interface InvoiceContextType {
  invoice: Invoice;
  setInvoice: (invoice: Invoice) => void;
  updateInvoice: (partial: Partial<Invoice>) => void;
  updateSender: (partial: Partial<Invoice["sender"]>) => void;
  updateReceiver: (partial: Partial<Invoice["receiver"]>) => void;
  updateDetails: (partial: Partial<Invoice["details"]>) => void;
  setItems: (items: Invoice["details"]["items"]) => void;
  resetInvoice: () => void;
  getInvoiceJson: () => string;
  saveInvoiceJson: () => Promise<SaveResult>;
  loadFromJson: (json: string) => { success: boolean; error?: string };
}

const InvoiceContext = createContext<InvoiceContextType | undefined>(undefined);

export function InvoiceProvider({ children }: { children: ReactNode }) {
  const [invoice, setInvoiceState] = useState<Invoice>(getDefaultInvoice);

  const setInvoice = useCallback((next: Invoice) => {
    setInvoiceState(next);
  }, []);

  const updateInvoice = useCallback((partial: Partial<Invoice>) => {
    setInvoiceState((prev) => ({
      ...prev,
      ...partial,
      sender: { ...prev.sender, ...partial.sender },
      receiver: { ...prev.receiver, ...partial.receiver },
      details: { ...prev.details, ...partial.details },
    }));
  }, []);

  const updateSender = useCallback(
    (partial: Partial<Invoice["sender"]>) => {
      setInvoiceState((prev) => ({
        ...prev,
        sender: { ...prev.sender, ...partial },
      }));
    },
    []
  );

  const updateReceiver = useCallback(
    (partial: Partial<Invoice["receiver"]>) => {
      setInvoiceState((prev) => ({
        ...prev,
        receiver: { ...prev.receiver, ...partial },
      }));
    },
    []
  );

  const updateDetails = useCallback(
    (partial: Partial<Invoice["details"]>) => {
      setInvoiceState((prev) => ({
        ...prev,
        details: { ...prev.details, ...partial },
      }));
    },
    []
  );

  const setItems = useCallback(
    (items: Invoice["details"]["items"]) => {
      setInvoiceState((prev) => ({
        ...prev,
        details: { ...prev.details, items },
      }));
    },
    []
  );

  const resetInvoice = useCallback(() => {
    setInvoiceState(getDefaultInvoice());
  }, []);

  const getInvoiceJson = useCallback(() => {
    const withTotals = getInvoiceWithComputedTotals(invoice);
    return JSON.stringify(withTotals, null, 2);
  }, [invoice]);

  const saveInvoiceJson = useCallback(async (): Promise<SaveResult> => {
    const json = getInvoiceJson();
    try {
      const handle = await (window as Window & typeof globalThis & { showSaveFilePicker?: (opts?: object) => Promise<FileSystemFileHandle> }).showSaveFilePicker?.({
        suggestedName: "invoice.json",
        types: [{ description: "JSON File", accept: { "application/json": [".json"] } }],
      });
      if (!handle) {
        // Browser doesn't support showSaveFilePicker – fall back to download
        const url = URL.createObjectURL(new Blob([json], { type: "application/json" }));
        const a = document.createElement("a");
        a.href = url;
        a.download = "invoice.json";
        a.click();
        URL.revokeObjectURL(url);
        return { success: true, fileName: "invoice.json" };
      }
      const writable = await handle.createWritable();
      await writable.write(json);
      await writable.close();
      return { success: true, fileName: handle.name };
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") {
        return { success: false, cancelled: true };
      }
      return { success: false, error: e instanceof Error ? e.message : String(e) };
    }
  }, [getInvoiceJson]);

  const loadFromJson = useCallback(
    (json: string): { success: boolean; error?: string } => {
      try {
        const parsed = JSON.parse(json);
        const invoice = parseInvoiceFromObject(parsed);
        setInvoiceState(invoice);
        i18n.changeLanguage(invoice.language ?? "en");
        return { success: true };
      } catch (e) {
        let error = "errors.parseFailed";
        if (e instanceof SyntaxError || (e instanceof Error && e.message === "Invalid JSON")) {
          error = "errors.invalidJson";
        } else if (e instanceof Error && e.message === "Missing required fields") {
          error = "errors.missingFields";
        } else if (e instanceof Error) {
          error = e.message;
        }
        return { success: false, error };
      }
    },
    []
  );

  const value = useMemo(
    () => ({
      invoice,
      setInvoice,
      updateInvoice,
      updateSender,
      updateReceiver,
      updateDetails,
      setItems,
      resetInvoice,
      getInvoiceJson,
      saveInvoiceJson,
      loadFromJson,
    }),
    [
      invoice,
      setInvoice,
      updateInvoice,
      updateSender,
      updateReceiver,
      updateDetails,
      setItems,
      resetInvoice,
      getInvoiceJson,
      saveInvoiceJson,
      loadFromJson,
    ]
  );

  return (
    <InvoiceContext.Provider value={value}>
      {children}
    </InvoiceContext.Provider>
  );
}

export function useInvoice() {
  const ctx = useContext(InvoiceContext);
  if (!ctx) throw new Error("useInvoice must be used within InvoiceProvider");
  return ctx;
}
