import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { LineItem } from "@/types/invoice";
import LineItemRow from "./LineItemRow";

export interface SortableLineItemProps {
  item: LineItem;
  index: number;
  currency: string;
  onUpdate: (id: string, partial: Partial<LineItem>) => void;
  onRemove: (id: string) => void;
}

export default function SortableLineItem({
  item,
  index,
  currency,
  onUpdate,
  onRemove,
}: SortableLineItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <LineItemRow
        item={item}
        index={index}
        currency={currency}
        onUpdate={onUpdate}
        onRemove={onRemove}
        dragHandleProps={{ ...attributes, ...listeners }}
        isDragging={isDragging}
      />
    </div>
  );
}
