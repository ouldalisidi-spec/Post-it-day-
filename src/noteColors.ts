import type { NoteColor } from "./types";

export const NOTE_COLOR_SWATCHES: Record<NoteColor, string> = {
  yellow: "bg-amber-100 border-amber-300",
  green: "bg-emerald-100 border-emerald-300",
  red: "bg-red-100 border-red-300",
};

export const NOTE_COLOR_PICKER_SWATCHES: Record<NoteColor, string> = {
  yellow: "bg-amber-200 border-amber-300",
  green: "bg-emerald-200 border-emerald-300",
  red: "bg-red-200 border-red-300",
};

export const NOTE_COLOR_MEANINGS: Record<NoteColor, string> = {
  yellow: "Ongoing",
  green: "Done",
  red: "Delay",
};

export const COLOR_LEGEND_ITEMS: {
  color: NoteColor;
  meaning: string;
  swatch: string;
}[] = [
  {
    color: "green",
    meaning: NOTE_COLOR_MEANINGS.green,
    swatch: "bg-emerald-300 border-emerald-500",
  },
  {
    color: "yellow",
    meaning: NOTE_COLOR_MEANINGS.yellow,
    swatch: "bg-amber-300 border-amber-500",
  },
  {
    color: "red",
    meaning: NOTE_COLOR_MEANINGS.red,
    swatch: "bg-red-300 border-red-500",
  },
];

export function normalizeNoteColor(value: string): NoteColor {
  if (value === "orange") return "red";
  if (value === "blue") return "yellow";
  if (value === "yellow" || value === "green" || value === "red") {
    return value;
  }
  return "yellow";
}
