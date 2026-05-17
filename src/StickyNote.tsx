import { useDraggable, useDroppable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { useProductionModeContext } from "../context/ProductionModeContext";
import { NOTE_COLOR_SWATCHES } from "../noteColors";
import type { Note } from "../types";
import NoteDueDate from "./NoteDueDate";

interface StickyNoteProps {
  note: Note;
  isGhost?: boolean;
  isOverlay?: boolean;
  hiddenByFilter?: boolean;
  onEdit: (note: Note) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
}

export default function StickyNote({
  note,
  isGhost = false,
  isOverlay = false,
  hiddenByFilter = false,
  onEdit,
  onDelete,
  onDuplicate,
}: StickyNoteProps) {
  const { productionMode } = useProductionModeContext();

  const { attributes, listeners, setNodeRef: setDragRef, transform } =
    useDraggable({
      id: note.id,
      data: { type: "note", note },
      disabled: isOverlay || hiddenByFilter,
    });

  const { setNodeRef: setDropRef, isOver } = useDroppable({
    id: note.id,
    data: { type: "note-target", note },
    disabled: isOverlay || hiddenByFilter,
  });

  const setNodeRef = (node: HTMLElement | null) => {
    if (!isOverlay) {
      setDragRef(node);
      setDropRef(node);
    }
  };

  const translate =
    isOverlay || isGhost ? undefined : CSS.Translate.toString(transform);

  const style = {
    transform: translate
      ? `${translate} rotate(${note.rotation}deg)`
      : isOverlay
        ? `rotate(0deg)`
        : `rotate(${note.rotation}deg)`,
  };

  const displayText = note.text.trim() || (productionMode ? "—" : "(No description)");

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(note);
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLElement>) => {
    if (e.detail > 1) {
      e.stopPropagation();
      return;
    }
    listeners?.onPointerDown?.(e);
  };

  if (isGhost) {
    return (
      <div
        className="h-[88px] w-[152px] shrink-0 rounded-md border-2 border-dashed border-slate-300 bg-slate-100/80"
        aria-hidden
      />
    );
  }

  return (
    <article
      ref={isOverlay ? undefined : setNodeRef}
      data-pdf-note
      style={style}
      className={`group relative w-[152px] shrink-0 rounded-md border-2 px-2.5 py-2 shadow-note ${
        NOTE_COLOR_SWATCHES[note.color]
      } ${hiddenByFilter ? "note-filter-hidden" : ""} ${
        isOverlay ? "cursor-grabbing shadow-note-lift scale-105" : "cursor-grab hover:shadow-note-lift active:cursor-grabbing"
      } ${isOver && !isOverlay ? "ring-2 ring-sky-600" : ""}`}
      data-filter-hidden={hiddenByFilter ? "true" : undefined}
      title={isOverlay ? undefined : "Double-click to edit"}
      onDoubleClick={isOverlay ? undefined : handleDoubleClick}
      {...(isOverlay ? {} : attributes)}
      {...(isOverlay ? {} : listeners)}
      {...(isOverlay ? {} : { onPointerDown: handlePointerDown })}
    >
      <p className="line-clamp-4 whitespace-pre-wrap break-words text-sm leading-snug text-slate-900">
        {displayText}
      </p>
      <p className="mt-2 truncate border-t-2 border-black/10 pt-1.5 text-xs font-bold text-slate-700">
        {note.authorName}
      </p>
      {note.dueDate ? (
        <NoteDueDate dueDate={note.dueDate} className="mt-1" />
      ) : null}

      {!isOverlay && productionMode ? (
        <div className="pdf-hide mt-2 flex gap-1 border-t border-black/10 pt-2">
          <button
            type="button"
            onClick={() => onEdit(note)}
            onPointerDown={(e) => e.stopPropagation()}
            className="flex-1 rounded border border-slate-400 bg-white py-1.5 text-xs font-bold text-slate-800 hover:bg-slate-50"
          >
            Change
          </button>
          <button
            type="button"
            onClick={() => {
              if (window.confirm("Remove this task?")) onDelete(note.id);
            }}
            onPointerDown={(e) => e.stopPropagation()}
            className="flex-1 rounded border border-red-400 bg-white py-1.5 text-xs font-bold text-red-800 hover:bg-red-50"
          >
            Remove
          </button>
        </div>
      ) : null}

      {!isOverlay && !productionMode ? (
        <div
          className="pdf-hide absolute -right-1 -top-1 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100"
          onPointerDown={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={() => onEdit(note)}
            className="rounded border border-slate-300 bg-white px-2 py-1 text-xs font-semibold text-slate-800 hover:bg-slate-50"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => onDuplicate(note.id)}
            className="rounded border border-slate-300 bg-white px-2 py-1 text-xs font-semibold text-slate-800 hover:bg-slate-50"
          >
            Copy
          </button>
          <button
            type="button"
            onClick={() => {
              if (window.confirm("Delete this task note?")) onDelete(note.id);
            }}
            className="rounded border border-red-300 bg-white px-2 py-1 text-xs font-semibold text-red-700 hover:bg-red-50"
          >
            Del
          </button>
        </div>
      ) : null}
    </article>
  );
}
