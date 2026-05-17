import { v4 as uuidv4 } from "uuid";
import { normalizeNoteColor } from "./noteColors";
import type { ColumnId, Note, NoteColor, RowId } from "./types";
import { NOTE_COLORS } from "./types";

export function randomRotation(): number {
  return Math.round((Math.random() * 4 - 2) * 10) / 10;
}

export function createNote(
  partial: Pick<
    Note,
    "text" | "authorName" | "color" | "columnId" | "rowId"
  > &
    Partial<Pick<Note, "order" | "dueDate">>,
): Note {
  const now = new Date().toISOString();
  return {
    id: uuidv4(),
    text: partial.text,
    authorName: partial.authorName,
    color: partial.color,
    columnId: partial.columnId,
    rowId: partial.rowId,
    order: partial.order ?? Date.now(),
    rotation: randomRotation(),
    ...(partial.dueDate ? { dueDate: partial.dueDate } : {}),
    createdAt: now,
    updatedAt: now,
  };
}

export function duplicateNote(note: Note, order: number): Note {
  const now = new Date().toISOString();
  return {
    ...note,
    id: uuidv4(),
    order,
    rotation: randomRotation(),
    createdAt: now,
    updatedAt: now,
  };
}

export function isValidColor(value: string): value is NoteColor {
  return NOTE_COLORS.includes(normalizeNoteColor(value));
}

export function nextOrderInCell(
  notes: Note[],
  rowId: RowId,
  columnId: ColumnId,
): number {
  const inCell = notes.filter(
    (n) => n.rowId === rowId && n.columnId === columnId,
  );
  if (inCell.length === 0) return Date.now();
  return Math.max(...inCell.map((n) => n.order)) + 1;
}
