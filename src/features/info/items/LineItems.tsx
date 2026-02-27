import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useInvoice } from "@/context/InvoiceContext";
import { createDefaultItem } from "@/lib/defaults";
import type { LineItem } from "@/types/invoice";
import SortableLineItem from "./SortableLineItem";
import { Plus } from "lucide-react";

const POINTER_SENSOR_OPTIONS = { activationConstraint: { distance: 8 } };

export default function LineItems() {
  const { t } = useTranslation();
  const { invoice, setItems } = useInvoice();
  const items = invoice.details.items;
  const currency = invoice.details.currency;
  const [itemToRemove, setItemToRemove] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, POINTER_SENSOR_OPTIONS),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((i) => i.id === active.id);
      const newIndex = items.findIndex((i) => i.id === over.id);
      if (oldIndex >= 0 && newIndex >= 0) {
        setItems(arrayMove(items, oldIndex, newIndex));
      }
    }
  };

  const handleUpdate = (id: string, partial: Partial<LineItem>) => {
    setItems(
      items.map((item) =>
        item.id === id ? { ...item, ...partial } : item
      )
    );
  };

  const handleRemoveClick = (id: string) => {
    setItemToRemove(id);
  };

  const handleRemoveConfirm = () => {
    if (!itemToRemove) return;
    const next = items.filter((i) => i.id !== itemToRemove);
    if (next.length === 0) {
      setItems([createDefaultItem()]);
    } else {
      setItems(next);
    }
    setItemToRemove(null);
  };

  const handleRemoveCancel = () => {
    setItemToRemove(null);
  };

  const handleAdd = () => {
    setItems([...items, createDefaultItem()]);
  };

  return (
    <div>
      <h2 className="font-bold mb-5">{t("lineItems.title")}</h2>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={items.map((i) => i.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-4">
            {items.map((item, index) => (
              <SortableLineItem
                key={item.id}
                item={item}
                index={index}
                currency={currency}
                onUpdate={handleUpdate}
                onRemove={handleRemoveClick}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <Button className="w-full mt-5" onClick={handleAdd}>
        <Plus className="mr-2 h-4 w-4 shrink-0" />
        {t("lineItems.addNewItem")}
      </Button>

      <AlertDialog open={itemToRemove !== null} onOpenChange={(open) => !open && setItemToRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("lineItems.removeItemTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("lineItems.removeItemDescription")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleRemoveCancel}>{t("lineItems.cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleRemoveConfirm} className={buttonVariants({ variant: "destructive" })}>
              {t("lineItems.remove")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
