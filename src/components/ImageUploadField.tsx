import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Label } from "@/components/ui/label";
import { ImagePlus, X } from "lucide-react";

export interface ImageUploadFieldProps {
  value: string | undefined;
  onSelect: (file: File) => void | Promise<void>;
  onRemove: () => void;
  label: string;
  accept?: string;
  uploadPlaceholder: string;
  removeAriaLabel: string;
  imageAlt: string;
  imageClassName?: string;
  inputId: string;
  changeButtonLabel?: string;
}

export default function ImageUploadField({
  value,
  onSelect,
  onRemove,
  label,
  accept = "image/*",
  uploadPlaceholder,
  removeAriaLabel,
  imageAlt,
  imageClassName = "h-20 w-auto max-w-[120px] object-contain border border-gray-200 rounded-md",
  inputId,
  changeButtonLabel,
}: ImageUploadFieldProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    await onSelect(file);
  };

  const triggerClick = () => fileInputRef.current?.click();

  return (
    <Field>
      <Label>{label}</Label>
      <div className="flex items-center gap-3">
        <input
          ref={fileInputRef}
          id={inputId}
          type="file"
          accept={accept}
          className="hidden"
          aria-hidden
          onChange={handleChange}
        />
        {value ? (
          <div className="relative inline-block">
            <img
              src={value}
              alt={imageAlt}
              className={imageClassName}
            />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
              onClick={onRemove}
              aria-label={removeAriaLabel}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ) : (
          <Label
            htmlFor={inputId}
            className="flex flex-col items-center justify-center gap-2 w-40 h-28 bg-muted border border-border rounded-md cursor-pointer hover:border-primary transition-colors"
          >
            <ImagePlus className="h-8 w-8 text-muted-foreground shrink-0" />
            <span className="text-sm text-center text-muted-foreground">{uploadPlaceholder}</span>
          </Label>
        )}
        {changeButtonLabel && value && (
          <Button type="button" variant="outline" size="sm" onClick={triggerClick}>
            {changeButtonLabel}
          </Button>
        )}
      </div>
    </Field>
  );
}
