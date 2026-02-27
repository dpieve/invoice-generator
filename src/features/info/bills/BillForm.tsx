import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { SenderReceiver, CustomInput } from "@/types/invoice";
import { Plus } from "lucide-react";
import { useTranslation } from "react-i18next";

interface BillFormProps {
  title: string;
  data: SenderReceiver;
  onUpdate: (partial: Partial<SenderReceiver>) => void;
  fromPlaceholders?: boolean;
}

export default function BillForm({
  title,
  data,
  onUpdate,
  fromPlaceholders = false,
}: BillFormProps) {
  const { t } = useTranslation();
  const prefix = fromPlaceholders ? "billForm.placeholderFrom" : "billForm.placeholderTo";
  const placeholders = {
    name: t(`${prefix}.name`),
    address: t(`${prefix}.address`),
    zipCode: t(`${prefix}.zipCode`),
    city: t(`${prefix}.city`),
    country: t(`${prefix}.country`),
    email: t(`${prefix}.email`),
    phone: t(`${prefix}.phone`),
  };
  const customInputs = data.customInputs ?? [];

  const addCustomInput = () => {
    onUpdate({
      customInputs: [...customInputs, { key: "", value: "" }],
    });
  };

  const updateCustomInput = (index: number, field: "key" | "value", value: string) => {
    const next = [...customInputs];
    next[index] = { ...next[index], [field]: value };
    onUpdate({ customInputs: next });
  };

  const removeCustomInput = (index: number) => {
    onUpdate({
      customInputs: customInputs.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="w-full min-w-0 md:w-1/2 space-y-4">
      <h2 className="text-xl font-bold">{title}</h2>

      <Field>
        <Label>{t("billForm.name")}</Label>
        <Input
          value={data.name}
          onChange={(e) => onUpdate({ name: e.target.value })}
          placeholder={placeholders.name}
        />
      </Field>
      <Field>
        <Label>{t("billForm.address")}</Label>
        <Input
          value={data.address}
          onChange={(e) => onUpdate({ address: e.target.value })}
          placeholder={placeholders.address}
        />
      </Field>
      <Field>
        <Label>{t("billForm.zipCode")}</Label>
        <Input
          value={data.zipCode}
          onChange={(e) => onUpdate({ zipCode: e.target.value })}
          placeholder={placeholders.zipCode}
        />
      </Field>
      <Field>
        <Label>{t("billForm.city")}</Label>
        <Input
          value={data.city}
          onChange={(e) => onUpdate({ city: e.target.value })}
          placeholder={placeholders.city}
        />
      </Field>
      <Field>
        <Label>{t("billForm.country")}</Label>
        <Input
          value={data.country}
          onChange={(e) => onUpdate({ country: e.target.value })}
          placeholder={placeholders.country}
        />
      </Field>
      <Field>
        <Label>{t("billForm.email")}</Label>
        <Input
          type="email"
          value={data.email}
          onChange={(e) => onUpdate({ email: e.target.value })}
          placeholder={placeholders.email}
        />
      </Field>
      <Field>
        <Label>{t("billForm.phone")}</Label>
        <Input
          value={data.phone}
          onChange={(e) => onUpdate({ phone: e.target.value })}
          placeholder={placeholders.phone}
        />
      </Field>

      {customInputs.map((item: CustomInput, index: number) => (
        <Field key={index} orientation="horizontal" className="items-center gap-2">
          <Input
            value={item.key}
            onChange={(e) => updateCustomInput(index, "key", e.target.value)}
            placeholder={t("billForm.key")}
            className="flex-1"
          />
          <Input
            value={item.value}
            onChange={(e) => updateCustomInput(index, "value", e.target.value)}
            placeholder={t("billForm.value")}
            className="flex-1"
          />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            onClick={() => removeCustomInput(index)}
            aria-label={t("billForm.removeCustomField")}
          >
            ×
          </Button>
        </Field>
      ))}

      <Button variant="ghost" onClick={addCustomInput}>
        <Plus className="mr-2 h-4 w-4 shrink-0" />
        {t("billForm.addCustomInput")}
      </Button>
    </div>
  );
}
