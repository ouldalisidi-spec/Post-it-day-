import { useDroppable } from "@dnd-kit/core";
import { useProductionModeContext } from "../context/ProductionModeContext";
import type { ColumnId, Note, RowId } from "../types";
import { cellId } from "../types";
import StickyNote from "./StickyNote";

interface GridCellProps {
  rowId: RowId;
  columnId: ColumnId;
  notes: Note[];
  isHighlighted: boolean;
  draggingNoteId: string | null;
  onEdit: (note: Note) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  noteFilter?: (note: Note) => boolean;
}

export default function GridCell({
  rowId,
  columnId,
  notes,
  isHighlighted,
  draggingNoteId,
  onEdit,
  onDelete,
  onDuplicate,
  noteFilter,
}: GridCellProps) {
  const { productionMode } = useProductionModeContext();
  const id = cellId(rowId, columnId);
  const { setNodeRef, isOver } = useDroppable({
    id,
    data: { type: "cell", rowId, columnId },
  });

  const showHighlight = isOver || isHighlighted;
  const hasVisibleNotes = notes.some(
    (n) => !noteFilter || noteFilter(n),
  );

  return (
    <td
      ref={setNodeRef}
      className={`align-top border-2 border-slate-300 p-3 transition-colors duration-150 ${
        showHighlight
          ? "bg-sky-100 ring-2 ring-inset ring-sky-500"
          : "bg-slate-50"
      }`}
    >
      <div
        data-cell-inner
        className="flex min-h-[160px] max-h-[360px] flex-wrap content-center justify-center gap-4 overflow-y-auto overflow-x-hidden p-1"
      >
        {notes.map((note) => (
          <StickyNote
            key={note.id}
            note={note}
            isGhost={draggingNoteId === note.id}
            hiddenByFilter={noteFilter ? !noteFilter(note) : false}
            onEdit={onEdit}
            onDelete={onDelete}
            onDuplicate={onDuplicate}
          />
        ))}
        {!hasVisibleNotes && !productionMode && (
          <span className="pdf-hide pointer-events-none w-full py-8 text-center text-xs text-slate-400">
            Drop tasks here
          </span>
        )}
      </div>
    </td>
  );
}
