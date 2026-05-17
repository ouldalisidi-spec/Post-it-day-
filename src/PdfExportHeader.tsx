import type { PdfDocumentMeta } from "../pdfDocumentMeta";

interface PdfExportHeaderProps {
  meta: PdfDocumentMeta;
  variant?: "board" | "meeting";
}

export default function PdfExportHeader({
  meta,
  variant = "board",
}: PdfExportHeaderProps) {
  const isMeeting = variant === "meeting";

  return (
    <header
      className={`pdf-export-header border-b-4 border-board-header bg-white ${
        isMeeting ? "px-2 pb-8 pt-2 text-center" : "px-6 py-6"
      }`}
    >
      {meta.projectName ? (
        <p
          className={`pdf-export-project font-semibold uppercase tracking-widest text-board-header ${
            isMeeting ? "mb-3 text-base" : "mb-2 text-sm"
          }`}
        >
          {meta.projectName}
        </p>
      ) : null}

      <h1
        className={`pdf-export-title font-bold text-slate-900 ${
          isMeeting ? "text-4xl" : "text-3xl"
        }`}
      >
        {meta.boardTitle}
      </h1>

      <div
        className={`pdf-export-subtitle mt-3 flex flex-wrap gap-x-6 gap-y-1 font-semibold text-slate-700 ${
          isMeeting ? "justify-center text-2xl" : "text-xl"
        }`}
      >
        <span>{meta.weekNumber}</span>
        <span className="text-slate-400" aria-hidden>
          |
        </span>
        <span>{meta.dateRange}</span>
      </div>
    </header>
  );
}
