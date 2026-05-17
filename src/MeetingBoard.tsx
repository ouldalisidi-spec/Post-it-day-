import type { RefObject } from "react";
import type { PdfDocumentMeta } from "../pdfDocumentMeta";
import { NOTE_COLOR_SWATCHES } from "../noteColors";
import type { Note } from "../types";
import { COLUMNS, ROWS } from "../types";
import type { ColumnId, RowId } from "../types";
import NoteDueDate from "./NoteDueDate";
import PdfExportFooter from "./PdfExportFooter";
import PdfExportHeader from "./PdfExportHeader";

interface MeetingBoardProps {
  exportRootRef?: RefObject<HTMLDivElement>;
  pdfMeta: PdfDocumentMeta;
  notesByCell: (rowId: RowId, columnId: ColumnId) => Note[];
}

function MeetingNote({ note }: { note: Note }) {
  const text = note.text.trim();
  return (
    <article
      data-pdf-note
      className={`mx-auto w-full max-w-[220px] rounded-lg border-2 px-5 py-4 text-center shadow-sm ${NOTE_COLOR_SWATCHES[note.color]}`}
      style={{ transform: "none" }}
    >
      <p className="text-lg font-semibold leading-snug text-slate-900">
        {text || "—"}
      </p>
      <p className="mt-3 text-base font-bold text-slate-700">{note.authorName}</p>
      {note.dueDate ? (
        <NoteDueDate dueDate={note.dueDate} className="mt-2" size="md" />
      ) : null}
    </article>
  );
}

export default function MeetingBoard({
  exportRootRef,
  pdfMeta,
  notesByCell,
}: MeetingBoardProps) {
  return (
    <div
      id="meeting-export-root"
      ref={exportRootRef}
      className="executive-document mx-auto max-w-[1500px] bg-white px-8 py-6"
    >
      <PdfExportHeader meta={pdfMeta} variant="meeting" />

      <table className="executive-grid w-full border-collapse">
        <thead>
          <tr className="bg-board-header text-white">
            <th className="w-40 border-2 border-slate-600 px-3 py-5 text-center text-lg font-bold">
              &nbsp;
            </th>
            {COLUMNS.map((col) => (
              <th
                key={col.id}
                className="border-2 border-slate-600 px-2 py-5 text-center"
              >
                <span className="text-3xl font-bold">{col.short}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {ROWS.map((row) => (
            <tr key={row.id}>
              <th className="border-2 border-slate-300 bg-slate-100 px-3 py-6 text-center text-xl font-bold text-slate-800">
                {row.label}
              </th>
              {COLUMNS.map((col) => {
                const notes = notesByCell(row.id, col.id);
                return (
                  <td
                    key={col.id}
                    className="align-middle border-2 border-slate-300 bg-white px-3 py-5"
                  >
                    <div
                      data-cell-inner
                      className="flex min-h-[120px] flex-col items-center justify-center gap-5"
                    >
                      {notes.map((note) => (
                        <MeetingNote key={note.id} note={note} />
                      ))}
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      <PdfExportFooter meta={pdfMeta} variant="meeting" />
    </div>
  );
}
