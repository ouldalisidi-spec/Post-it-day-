import { useEffect, useRef, useState } from "react";
import { exportElementToPdf } from "../exportBoardToPdf";
import type { PdfDocumentMeta } from "../pdfDocumentMeta";
import type { ColumnId, Note, RowId } from "../types";
import MeetingBoard from "./MeetingBoard";
import PdfExportSettingsModal from "./PdfExportSettingsModal";

interface MeetingExportModalProps {
  open: boolean;
  boardFileName: string | null;
  pdfMeta: PdfDocumentMeta;
  onUpdatePdfMeta: (meta: PdfDocumentMeta) => void;
  notesByCell: (rowId: RowId, columnId: ColumnId) => Note[];
  onClose: () => void;
}

export default function MeetingExportModal({
  open,
  boardFileName,
  pdfMeta,
  onUpdatePdfMeta,
  notesByCell,
  onClose,
}: MeetingExportModalProps) {
  const exportRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onBeforePrint = () => document.body.classList.add("meeting-print-active");
    const onAfterPrint = () =>
      document.body.classList.remove("meeting-print-active");
    window.addEventListener("beforeprint", onBeforePrint);
    window.addEventListener("afterprint", onAfterPrint);
    return () => {
      window.removeEventListener("beforeprint", onBeforePrint);
      window.removeEventListener("afterprint", onAfterPrint);
      document.body.classList.remove("meeting-print-active");
    };
  }, [open]);

  if (!open) return null;

  const handleDownloadPdf = async (meta: PdfDocumentMeta) => {
    onUpdatePdfMeta(meta);
    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
    });
    const root = exportRef.current;
    if (!root) return;
    setIsExporting(true);
    try {
      await exportElementToPdf(root, boardFileName, {
        suffix: "meeting",
        rootId: "meeting-export-root",
      });
      setSettingsOpen(false);
    } catch {
      window.alert("Could not create meeting PDF. Try Print instead.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <>
      <div
        className="meeting-export-portal fixed inset-0 z-50 flex flex-col bg-slate-900/95"
        role="dialog"
        aria-modal="true"
        aria-labelledby="meeting-export-title"
      >
        <div className="flex shrink-0 items-center justify-between gap-4 border-b border-white/20 bg-board-header px-5 py-4 text-white">
          <div>
            <h2 id="meeting-export-title" className="text-xl font-bold">
              Meeting export
            </h2>
            <p className="text-sm text-white/80">
              Executive layout for coordination meetings.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setSettingsOpen(true)}
              className="rounded border-2 border-white/30 bg-white/15 px-5 py-2.5 text-base font-semibold hover:bg-white/25"
            >
              Document settings
            </button>
            <button
              type="button"
              onClick={() => void handleDownloadPdf(pdfMeta)}
              disabled={isExporting}
              className="rounded border-2 border-white/30 bg-white/15 px-5 py-2.5 text-base font-semibold hover:bg-white/25 disabled:opacity-60"
            >
              {isExporting ? "Creating PDF…" : "Download PDF"}
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="rounded border-2 border-white/30 bg-white/15 px-5 py-2.5 text-base font-semibold hover:bg-white/25"
            >
              Print
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded border-2 border-white/40 px-5 py-2.5 text-base font-semibold hover:bg-white/10"
            >
              Close
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-4">
          <MeetingBoard
            exportRootRef={exportRef}
            pdfMeta={pdfMeta}
            notesByCell={notesByCell}
          />
        </div>
      </div>

      <PdfExportSettingsModal
        open={settingsOpen}
        initialMeta={pdfMeta}
        onClose={() => setSettingsOpen(false)}
        onExport={(meta) => void handleDownloadPdf(meta)}
        isExporting={isExporting}
      />
    </>
  );
}
