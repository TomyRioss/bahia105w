"use client";

import {
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { restrictToParentElement } from "@dnd-kit/modifiers";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

/**
 * Reordenamiento con dnd-kit: funciona con mouse, touch y teclado.
 * `ids` son las claves estables de cada item, en el orden actual.
 */
export function SortableList({
  id,
  ids,
  onReorder,
  children,
}: {
  id: string;
  ids: string[];
  onReorder: (from: number, to: number) => void;
  children: React.ReactNode;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function handleDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const from = ids.indexOf(String(active.id));
    const to = ids.indexOf(String(over.id));
    if (from === -1 || to === -1) return;
    onReorder(from, to);
  }

  return (
    <DndContext
      id={id}
      sensors={sensors}
      collisionDetection={closestCenter}
      modifiers={[restrictToParentElement]}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={ids} strategy={rectSortingStrategy}>
        {children}
      </SortableContext>
    </DndContext>
  );
}

type HandleProps = React.HTMLAttributes<HTMLElement> & { ref: (node: HTMLElement | null) => void };

/**
 * `children` recibe los props del handle. Si se los pasás a un elemento
 * interno, solo ese arrastra; si no, el item entero es el handle.
 */
export function SortableItem({
  id,
  className,
  draggingClassName,
  children,
}: {
  id: string;
  className?: string;
  draggingClassName?: string;
  children: (handle: HandleProps, isDragging: boolean) => React.ReactNode;
}) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } =
    useSortable({ id });

  const handle: HandleProps = {
    ...attributes,
    ...listeners,
    ref: setActivatorNodeRef,
  };

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={isDragging ? `${className ?? ""} ${draggingClassName ?? ""}`.trim() : className}
    >
      {children(handle, isDragging)}
    </div>
  );
}

export { arrayMove };
