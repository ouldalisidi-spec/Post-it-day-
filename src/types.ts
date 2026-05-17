export const NOTE_COLORS = ["yellow", "green", "red"] as const;
export type NoteColor = (typeof NOTE_COLORS)[number];

export const COLUMNS = [
  { id: "MO", label: "Monday", short: "MO" },
  { id: "TU", label: "Tuesday", short: "TU" },
  { id: "WE", label: "Wednesday", short: "WE" },
  { id: "TH", label: "Thursday", short: "TH" },
  { id: "FR", label: "Friday", short: "FR" },
  { id: "SA", label: "Saturday", short: "SA" },
  { id: "SU", label: "Sunday", short: "SU" },
] as const;

export const ROWS = [
  { id: "SPI", label: "SPI" },
  { id: "CSR", label: "CSR" },
  { id: "SPV", label: "SPV" },
  { id: "PREP", label: "PREP / SURVEY" },
] as const;

export type ColumnId = (typeof COLUMNS)[number]["id"];
export type RowId = (typeof ROWS)[number]["id"];

export interface Note {
  id: string;
  text: string;
  authorName: string;
  color: NoteColor;
  columnId: ColumnId;
  rowId: RowId;
  order: number;
  rotation: number;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

export type NoteFormData = {
  text: string;
  authorName: string;
  color: NoteColor;
  columnId: ColumnId;
  rowId: RowId;
  dueDate?: string;
};

export interface BoardState {
  version: 1;
  notes: Note[];
  boardName?: string;
  savedAt: string;
}

export type CellId = `${RowId}::${ColumnId}`;

export function cellId(rowId: RowId, columnId: ColumnId): CellId {
  return `${rowId}::${columnId}`;
}

export function parseCellId(id: string): { rowId: RowId; columnId: ColumnId } | null {
  const [rowId, columnId] = id.split("::");
  if (
    ROWS.some((r) => r.id === rowId) &&
    COLUMNS.some((c) => c.id === columnId)
  ) {
    return { rowId: rowId as RowId, columnId: columnId as ColumnId };
  }
  return null;
}
