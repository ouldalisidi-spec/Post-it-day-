import {
  DndContext,
  DragOverlay,
  PointerSensor,
  pointerWithin,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { useCallback, useState, type RefObject } from "react";
import type { PdfDocumentMeta } from "../pdfDocumentMeta";
import { NOTE_COLOR_SWATCHES } from "../noteColors";
import type { Note } from "../types";
import { COLUMNS, ROWS, cellId, type CellId } from "../types";
import GridCell from "./GridCell";
import PdfExportFooter from "./PdfExportFooter";
import PdfExportHeader from "./PdfExportHeader";

interface BoardProps {
  exportRootRef?: RefObject<HTMLDivElement>;
  pdfMeta: PdfDocumentMeta;
  notesByCell: (
    rowId: (typeof ROWS)[number]["id"],
    columnId: (typeof COLUMNS)[number]["id"],
  ) => Note[];
  onDragEnd: (activeId: string, overId: string | null) => void;
  onEdit: (note: Note) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  noteFilter?: (note: Note) => boolean;
}

function resolveDropTarget(overId: string | null): CellId | null {
  if (!overId) return null;
  if (overId.includes("::")) return overId as CellId;
  return null;
}

export default function Board({
  exportRootRef,
  pdfMeta,
  notesByCell,
  onDragEnd,
  onEdit,
  onDelete,
  onDuplicate,
  noteFilter,
}: BoardProps) {
  const [activeNote, setActiveNote] = useState<Note | null>(null);
  const [highlightedCell, setHighlightedCell] = useState<CellId | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
  );

  const handleDragStart = (event: DragStartEvent) => {
    const note = event.active.data.current?.note as Note | undefined;
    if (note) {
      setActiveNote(note);
      setHighlightedCell(cellId(note.rowId, note.columnId));
    }
  };

  const handleDragOver = useCallback((event: DragOverEvent) => {
    const overId = event.over ? String(event.over.id) : null;
    if (!overId) {
      setHighlightedCell(null);
      return;
    }

    const targetCell = resolveDropTarget(overId);
    if (targetCell) {
      setHighlightedCell(targetCell);
      return;
    }

    const overNote = event.over?.data.current?.note as Note | undefined;
    if (overNote) {
      setHighlightedCell(cellId(overNote.rowId, overNote.columnId));
    }
  }, []);

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveNote(null);
    setHighlightedCell(null);
    const activeId = String(event.active.id);
    const overId = event.over ? String(event.over.id) : null;
    onDragEnd(activeId, overId);
  };

  const handleDragCancel = () => {
    setActiveNote(null);
    setHighlightedCell(null);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={pointerWithin}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div
        id="board-export-root"
        ref={exportRootRef}
        className="executive-document rounded border-2 border-slate-400 bg-white shadow-sm"
      >
        <PdfExportHeader meta={pdfMeta} variant="board" />

        <div data-board-scroll className="overflow-auto">
          <table className="executive-grid w-full min-w-[1280px] border-collapse table-fixed">
            <thead>
              <tr className="bg-board-header text-white">
                <th className="w-36 border-2 border-slate-600 px-3 py-5 text-center text-base font-bold uppercase">
                  Category
                </th>
                {COLUMNS.map((col) => (
                  <th
                    key={col.id}
                    className="border-2 border-slate-600 px-2 py-4 text-center"
                  >
                    <span className="block text-2xl font-bold">{col.short}</span>
                    <span className="mt-1 block text-sm font-medium opacity-90">
                      {col.label}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROWS.map((row) => (
                <tr key={row.id}>
                  <th className="border-2 border-slate-300 bg-slate-200 px-3 py-5 text-center text-lg font-bold text-slate-800">
                    {row.label}
                  </th>
                  {COLUMNS.map((col) => {
                    const id = cellId(row.id, col.id);
                    return (
                      <GridCell
                        key={id}
                        rowId={row.id}
                        columnId={col.id}
                        notes={notesByCell(row.id, col.id)}
                        noteFilter={noteFilter}
                        isHighlighted={highlightedCell === id}
                        draggingNoteId={activeNote?.id ?? null}
                        onEdit={onEdit}
                        onDelete={onDelete}
                        onDuplicate={onDuplicate}
                      />
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <PdfExportFooter meta={pdfMeta} variant="board" />
      </div>

      <DragOverlay dropAnimation={{ duration: 200, easing: "cubic-bezier(0.2, 0, 0, 1)" }}>
        {activeNote ? (
          <StickyNoteOverlay note={activeNote} />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

function StickyNoteOverlay({ note }: { note: Note }) {
  return (
    <article
      className={`w-[180px] rounded-md border-2 px-3 py-2.5 shadow-note-lift ${NOTE_COLOR_SWATCHES[note.color]}`}
      style={{ transform: "rotate(0deg)" }}
    >
      <p className="line-clamp-4 text-base text-slate-900">
        {note.text.trim() || "—"}
      </p>
      <p className="mt-2 border-t-2 border-black/10 pt-1.5 text-sm font-bold text-slate-700">
        {note.authorName}
      </p>
    </article>
  );
}
