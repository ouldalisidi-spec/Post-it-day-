import type { Note } from "./types";

export interface BoardStats {
  total: number;
  done: number;
  ongoing: number;
  delayed: number;
  completionPercent: number;
}

export function computeBoardStats(notes: Note[]): BoardStats {
  let done = 0;
  let ongoing = 0;
  let delayed = 0;

  for (const note of notes) {
    if (note.color === "green") done += 1;
    else if (note.color === "yellow") ongoing += 1;
    else if (note.color === "red") delayed += 1;
  }

  const total = notes.length;
  const completionPercent =
    total === 0 ? 0 : Math.round((done / total) * 100);

  return { total, done, ongoing, delayed, completionPercent };
}
