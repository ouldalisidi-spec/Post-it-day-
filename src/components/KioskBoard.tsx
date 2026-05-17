import { COLOR_LEGEND_ITEMS, NOTE_COLOR_SWATCHES } from "../noteColors";
import NoteDueDate from "./NoteDueDate";
import type { PdfDocumentMeta } from "../pdfDocumentMeta";
import type { Note } from "../types";
import { COLUMNS, ROWS } from "../types";
import type { ColumnId, RowId } from "../types";

interface KioskBoardProps {
  pdfMeta: PdfDocumentMeta;
  notesByCell: (rowId: RowId, columnId: ColumnId) => Note[];
}

function KioskNote({ note }: { note: Note }) {
  const text = note.text.trim();
  return (
    <article
      className={`mx-auto w-full max-w-[280px] rounded-xl border-[3px] px-5 py-4 text-center shadow-md ${NOTE_COLOR_SWATCHES[note.color]}`}
      style={{ transform: "none" }}
    >
      <p className="text-2xl font-semibold leading-snug text-slate-900">
        {text || "—"}
      </p>
      <p className="mt-3 border-t-2 border-black/15 pt-2 text-xl font-bold text-slate-800">
        {note.authorName}
      </p>
      {note.dueDate ? (
        <NoteDueDate dueDate={note.dueDate} className="mt-2" size="md" />
      ) : null}
    </article>
  );
}

export default function KioskBoard({ pdfMeta, notesByCell }: KioskBoardProps) {
  const reference = pdfMeta.companyReference.trim() || pdfMeta.projectName.trim();

  return (
    <div
      id="kiosk-board-content"
      className="kiosk-board inline-block rounded-xl bg-white px-10 py-8 shadow-2xl"
    >
      <header className="mb-6 border-b-4 border-board-header pb-6 text-center">
        {reference ? (
          <p className="mb-3 text-lg font-semibold uppercase tracking-[0.2em] text-board-header">
            {reference}
          </p>
        ) : null}
        <h1 className="text-5xl font-bold leading-tight text-slate-900">
          {pdfMeta.boardTitle}
        </h1>
        <p className="mt-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-1 text-3xl font-semibold text-slate-700">
          <span>{pdfMeta.weekNumber}</span>
          <span className="text-slate-400" aria-hidden>
            |
          </span>
          <span>{pdfMeta.dateRange}</span>
        </p>
      </header>

      <table className="w-full min-w-[1400px] border-collapse">
        <thead>
          <tr className="bg-board-header text-white">
            <th className="w-44 border-[3px] border-slate-600 px-3 py-5" />
            {COLUMNS.map((col) => (
              <th
                key={col.id}
                className="border-[3px] border-slate-600 px-2 py-5 text-center"
              >
                <span className="text-4xl font-bold">{col.short}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {ROWS.map((row) => (
            <tr key={row.id}>
              <th className="border-[3px] border-slate-300 bg-slate-200 px-3 py-6 text-center text-2xl font-bold text-slate-800">
                {row.label}
              </th>
              {COLUMNS.map((col) => {
                const notes = notesByCell(row.id, col.id);
                return (
                  <td
                    key={col.id}
                    className="align-middle border-[3px] border-slate-300 bg-slate-50 px-3 py-5"
                  >
                    <div className="flex min-h-[140px] flex-col items-center justify-center gap-5">
                      {notes.map((note) => (
                        <KioskNote key={note.id} note={note} />
                      ))}
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-10 border-t-2 border-slate-200 pt-5">
        {COLOR_LEGEND_ITEMS.map((item) => (
          <div key={item.color} className="flex items-center gap-3">
            <span
              className={`h-7 w-12 rounded-md border-[3px] ${item.swatch}`}
              aria-hidden
            />
            <span className="text-xl font-semibold text-slate-800">
              <span className="capitalize">{item.color}</span>
              <span className="font-medium text-slate-600">
                {" "}
                = {item.meaning}
              </span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
