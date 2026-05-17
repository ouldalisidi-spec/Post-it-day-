import { useEffect, useState } from "react";
import {
  createDefaultPdfMeta,
  getDefaultDateOfIssue,
  normalizePdfMetaForExport,
  type PdfDocumentMeta,
} from "../pdfDocumentMeta";

interface PdfExportSettingsModalProps {
  open: boolean;
  initialMeta: PdfDocumentMeta;
  onClose: () => void;
  onExport: (meta: PdfDocumentMeta) => void;
  isExporting?: boolean;
}

export default function PdfExportSettingsModal({
  open,
  initialMeta,
  onClose,
  onExport,
  isExporting = false,
}: PdfExportSettingsModalProps) {
  const [draft, setDraft] = useState<PdfDocumentMeta>(initialMeta);

  useEffect(() => {
    if (open) setDraft(initialMeta);
  }, [open, initialMeta]);

  if (!open) return null;

  const setField = <K extends keyof PdfDocumentMeta>(
    key: K,
    value: PdfDocumentMeta[K],
  ) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onExport(normalizePdfMetaForExport(draft));
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pdf-settings-title"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !isExporting) onClose();
      }}
    >
      <form
        onSubmit={handleSubmit}
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-lg border-2 border-slate-300 bg-white shadow-xl"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <header className="border-b border-slate-200 px-6 py-4">
          <h2 id="pdf-settings-title" className="text-xl font-bold text-slate-900">
            PDF document settings
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Header, signatures, and footer for official exports.
          </p>
        </header>

        <div className="space-y-6 px-6 py-5">
          <fieldset className="space-y-4 border-0 p-0">
            <legend className="text-sm font-bold uppercase tracking-wide text-slate-500">
              Header
            </legend>
            <div>
              <label
                htmlFor="pdf-board-title"
                className="mb-1 block text-sm font-semibold text-slate-700"
              >
                Board title
              </label>
              <input
                id="pdf-board-title"
                type="text"
                value={draft.boardTitle}
                onChange={(e) => setField("boardTitle", e.target.value)}
                className="w-full rounded border border-slate-300 px-3 py-2.5 text-base"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="pdf-week"
                  className="mb-1 block text-sm font-semibold text-slate-700"
                >
                  Week number
                </label>
                <input
                  id="pdf-week"
                  type="text"
                  value={draft.weekNumber}
                  onChange={(e) => setField("weekNumber", e.target.value)}
                  className="w-full rounded border border-slate-300 px-3 py-2.5 text-base"
                  placeholder="Week 21"
                />
              </div>
              <div>
                <label
                  htmlFor="pdf-range"
                  className="mb-1 block text-sm font-semibold text-slate-700"
                >
                  Date range
                </label>
                <input
                  id="pdf-range"
                  type="text"
                  value={draft.dateRange}
                  onChange={(e) => setField("dateRange", e.target.value)}
                  className="w-full rounded border border-slate-300 px-3 py-2.5 text-base"
                  placeholder="20 May – 26 May 2026"
                />
              </div>
            </div>
            <div>
              <label
                htmlFor="pdf-project"
                className="mb-1 block text-sm font-semibold text-slate-700"
              >
                Project name <span className="font-normal text-slate-500">(header, optional)</span>
              </label>
              <input
                id="pdf-project"
                type="text"
                value={draft.projectName}
                onChange={(e) => setField("projectName", e.target.value)}
                className="w-full rounded border border-slate-300 px-3 py-2.5 text-base"
                placeholder="e.g. FPSO Alpha"
              />
            </div>
          </fieldset>

          <fieldset className="space-y-4 border-0 border-t border-slate-200 p-0 pt-5">
            <legend className="text-sm font-bold uppercase tracking-wide text-slate-500">
              Signatures &amp; issue
            </legend>
            <div>
              <label
                htmlFor="pdf-company-ref"
                className="mb-1 block text-sm font-semibold text-slate-700"
              >
                Company / project reference{" "}
                <span className="font-normal text-slate-500">(footer, optional)</span>
              </label>
              <input
                id="pdf-company-ref"
                type="text"
                value={draft.companyReference}
                onChange={(e) => setField("companyReference", e.target.value)}
                className="w-full rounded border border-slate-300 px-3 py-2.5 text-base"
                placeholder="e.g. Operations Dept. — Asset XYZ"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="pdf-prepared"
                  className="mb-1 block text-sm font-semibold text-slate-700"
                >
                  Prepared by
                </label>
                <input
                  id="pdf-prepared"
                  type="text"
                  value={draft.preparedBy}
                  onChange={(e) => setField("preparedBy", e.target.value)}
                  className="w-full rounded border border-slate-300 px-3 py-2.5 text-base"
                  placeholder="Name"
                  autoComplete="name"
                />
              </div>
              <div>
                <label
                  htmlFor="pdf-reviewed"
                  className="mb-1 block text-sm font-semibold text-slate-700"
                >
                  Reviewed by{" "}
                  <span className="font-normal text-slate-500">(optional)</span>
                </label>
                <input
                  id="pdf-reviewed"
                  type="text"
                  value={draft.reviewedBy}
                  onChange={(e) => setField("reviewedBy", e.target.value)}
                  className="w-full rounded border border-slate-300 px-3 py-2.5 text-base"
                  placeholder="Name"
                />
              </div>
            </div>
            <div>
              <label
                htmlFor="pdf-issue-date"
                className="mb-1 block text-sm font-semibold text-slate-700"
              >
                Date of issue
              </label>
              <input
                id="pdf-issue-date"
                type="text"
                value={draft.dateOfIssue}
                onChange={(e) => setField("dateOfIssue", e.target.value)}
                className="w-full rounded border border-slate-300 px-3 py-2.5 text-base"
                placeholder={getDefaultDateOfIssue()}
              />
            </div>
          </fieldset>
        </div>

        <footer className="flex justify-end gap-2 border-t border-slate-200 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={isExporting}
            className="rounded border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isExporting}
            className="rounded bg-board-header px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-60"
          >
            {isExporting ? "Creating PDF…" : "Create PDF"}
          </button>
        </footer>
      </form>
    </div>
  );
}
