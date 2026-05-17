import type { Note, NoteColor } from "./types";
import { NOTE_COLORS } from "./types";

export interface BoardFilters {
  nameQuery: string;
  colors: Record<NoteColor, boolean>;
}

export const DEFAULT_BOARD_FILTERS: BoardFilters = {
  nameQuery: "",
  colors: {
    yellow: true,
    green: true,
    red: true,
  },
};

export function hasActiveBoardFilters(filters: BoardFilters): boolean {
  if (filters.nameQuery.trim().length > 0) return true;
  return NOTE_COLORS.some((c) => !filters.colors[c]);
}

export function noteMatchesBoardFilters(
  note: Note,
  filters: BoardFilters,
): boolean {
  const q = filters.nameQuery.trim().toLowerCase();
  if (q && !note.authorName.toLowerCase().includes(q)) {
    return false;
  }
  if (!filters.colors[note.color]) {
    return false;
  }
  return true;
}

export function countMatchingNotes(
  notes: Note[],
  filters: BoardFilters,
): number {
  return notes.filter((n) => noteMatchesBoardFilters(n, filters)).length;
}
