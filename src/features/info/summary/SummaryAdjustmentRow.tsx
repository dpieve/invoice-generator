import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { RefreshCw } from "lucide-react";

export interface SummaryAdjustmentRowProps {
  label: string;
  enabled: boolean;
  onEnabledChange: (enabled: boolean) => void;
  value: number;
  onValueChange: (value: number) => void;
  amountType: "amount" | "percentage";
  onTypeToggle: () => void;
  currency: string;
  toggleAriaLabel: string;
}

export default function SummaryAdjustmentRow({
  label,
  enabled,
  onEnabledChange,
  value,
  onValueChange,
  amountType,
  onTypeToggle,
  currency,
  toggleAriaLabel,
}: SummaryAdjustmentRowProps) {
  return (
    <div className="flex justify-between items-center gap-4">
      <Label className="shrink-0">{label}</Label>
      <div className="flex items-center justify-end gap-1.5 min-w-[8rem]">
        {enabled && (
          <>
            <button
              type="button"
              onClick={onTypeToggle}
              className="p-1 rounded hover:bg-muted"
              aria-label={toggleAriaLabel}
            >
              <RefreshCw className="h-4 w-4 text-muted-foreground" />
            </button>
            <Input
              type="number"
              min={0}
              step="0.01"
              className="w-20 h-8 text-right"
              value={value || ""}
              onChange={(e) => onValueChange(Number(e.target.value) || 0)}
            />
            <span className="text-sm w-8 text-right">
              {amountType === "percentage" ? "%" : currency}
            </span>
          </>
        )}
        <Switch checked={enabled} onCheckedChange={onEnabledChange} />
      </div>
    </div>
  );
}
