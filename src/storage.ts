import { normalizeDueDate } from "./dueDate";
import { normalizeNoteColor } from "./noteColors";
import type { BoardState, Note } from "./types";
import { COLUMNS, NOTE_COLORS, ROWS } from "./types";
import type { NoteColor } from "./types";

export const DEFAULT_BOARD_FILENAME = "scheduling-board.json";

export function createEmptyBoard(): BoardState {
  return {
    version: 1,
    notes: [],
    boardName: DEFAULT_BOARD_FILENAME,
    savedAt: new Date().toISOString(),
  };
}

export function serializeBoard(state: BoardState): string {
  const payload: BoardState = {
    ...state,
    savedAt: new Date().toISOString(),
  };
  return JSON.stringify(payload, null, 2);
}

export function buildBoardState(
  notes: Note[],
  boardName: string,
): BoardState {
  return {
    version: 1,
    notes,
    boardName,
    savedAt: new Date().toISOString(),
  };
}

function isValidNote(n: unknown): n is Note {
  if (!n || typeof n !== "object") return false;
  const note = n as Note;
  return (
    typeof note.id === "string" &&
    typeof note.text === "string" &&
    typeof note.authorName === "string" &&
    note.authorName.trim().length > 0 &&
    NOTE_COLORS.includes(note.color as NoteColor) &&
    COLUMNS.some((c) => c.id === note.columnId) &&
    ROWS.some((r) => r.id === note.rowId)
  );
}

function normalizeNote(raw: Note): Note {
  const dueDate = normalizeDueDate(raw.dueDate);
  const base: Note = {
    ...raw,
    authorName: raw.authorName.trim(),
    text: raw.text ?? "",
    color: normalizeNoteColor(String(raw.color)),
    order: typeof raw.order === "number" ? raw.order : Date.now(),
    rotation: typeof raw.rotation === "number" ? raw.rotation : 0,
  };
  delete base.dueDate;
  if (dueDate) base.dueDate = dueDate;
  return base;
}

export function parseImportedFile(
  content: string,
  fallbackName = DEFAULT_BOARD_FILENAME,
): BoardState | null {
  try {
    const parsed = JSON.parse(content) as BoardState;
    if (parsed.version !== 1 || !Array.isArray(parsed.notes)) return null;

    const notes = parsed.notes
      .filter(isValidNote)
      .map(normalizeNote);

    return {
      version: 1,
      notes,
      boardName: parsed.boardName ?? fallbackName,
      savedAt: parsed.savedAt ?? new Date().toISOString(),
    };
  } catch {
    return null;
  }
}
