import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { LineItem } from "@/types/invoice";
import { computeItemTotal } from "@/lib/calculations";
import { GripVertical, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";

interface LineItemRowProps {
  item: LineItem;
  index: number;
  currency: string;
  onUpdate: (id: string, partial: Partial<LineItem>) => void;
  onRemove: (id: string) => void;
  dragHandleProps?: React.HTMLAttributes<HTMLButtonElement> | null;
  isDragging?: boolean;
}

export default function LineItemRow({
  item,
  index,
  currency,
  onUpdate,
  onRemove,
  dragHandleProps,
  isDragging,
}: LineItemRowProps) {
  const { t } = useTranslation();
  const total = computeItemTotal(item.quantity, item.unitPrice);

  return (
    <div
      className={`rounded-lg border p-4 space-y-4 bg-card ${isDragging ? "opacity-50" : ""}`}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <button
            type="button"
            className="touch-none p-1 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"
            aria-label={t("lineItems.dragToReorder")}
            {...(dragHandleProps ?? {})}
          >
            <GripVertical className="h-5 w-5" />
          </button>
          <h3 className="font-semibold truncate">
            #{index + 1} – {item.name || t("lineItems.emptyName")}
          </h3>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Field>
          <Label>{t("lineItems.name")}</Label>
          <Input
            placeholder={t("lineItems.itemName")}
            value={item.name}
            onChange={(e) => onUpdate(item.id, { name: e.target.value })}
          />
        </Field>
        <Field>
          <Label>{t("lineItems.quantity")}</Label>
          <Input
            type="number"
            min={0}
            value={item.quantity || ""}
            onChange={(e) =>
              onUpdate(item.id, { quantity: Number(e.target.value) || 0 })
            }
          />
        </Field>
        <Field>
          <Label>{t("lineItems.rate")} ({currency})</Label>
          <Input
            type="number"
            min={0}
            step="0.01"
            value={item.unitPrice || ""}
            onChange={(e) =>
              onUpdate(item.id, { unitPrice: Number(e.target.value) || 0 })
            }
          />
        </Field>
      </div>

      <Field>
        <Label>{t("lineItems.total")}</Label>
        <p className="text-lg font-medium">
          {total.toFixed(2)} {currency}
        </p>
      </Field>

      <Field>
        <Label>{t("lineItems.description")}</Label>
        <Textarea
          placeholder={t("lineItems.itemDescription")}
          value={item.description}
          onChange={(e) => onUpdate(item.id, { description: e.target.value })}
          className="min-h-[80px]"
        />
      </Field>

      <Button
        type="button"
        variant="destructive"
        onClick={() => onRemove(item.id)}
      >
        <Trash2 className="mr-2 h-4 w-4" />
        {t("lineItems.removeItem")}
      </Button>
    </div>
  );
}
