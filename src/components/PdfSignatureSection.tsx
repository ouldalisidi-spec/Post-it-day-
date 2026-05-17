import type { PdfDocumentMeta } from "../pdfDocumentMeta";
import { formatPdfExportTimestamp } from "../pdfDocumentMeta";

interface PdfSignatureSectionProps {
  meta: PdfDocumentMeta;
  variant?: "board" | "meeting";
}

function SignatureLine({
  label,
  value,
  wide = false,
}: {
  label: string;
  value: string;
  wide?: boolean;
}) {
  return (
    <div className={wide ? "sm:col-span-2" : ""}>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-1 min-h-[1.35rem] border-b border-slate-400 pb-0.5 text-sm font-medium text-slate-900">
        {value || "\u00a0"}
      </p>
    </div>
  );
}

export default function PdfSignatureSection({
  meta,
  variant = "board",
}: PdfSignatureSectionProps) {
  const isMeeting = variant === "meeting";
  const reference = meta.companyReference.trim() || meta.projectName.trim();
  const exportedAt = formatPdfExportTimestamp();

  return (
    <section
      className={`pdf-signature-section border-t border-slate-300 bg-white ${
        isMeeting ? "px-4 py-5" : "px-6 py-5"
      }`}
    >
      {reference ? (
        <p
          className={`mb-4 text-center font-medium uppercase tracking-widest text-slate-500 ${
            isMeeting ? "text-xs" : "text-[11px]"
          }`}
        >
          {reference}
        </p>
      ) : null}

      <div
        className={`mx-auto grid max-w-4xl grid-cols-1 gap-x-10 gap-y-4 sm:grid-cols-2 ${
          isMeeting ? "text-base" : "text-sm"
        }`}
      >
        <SignatureLine label="Prepared by" value={meta.preparedBy} />
        <SignatureLine
          label="Reviewed by"
          value={meta.reviewedBy || "—"}
        />
        <SignatureLine
          label="Date of issue"
          value={meta.dateOfIssue}
          wide
        />
      </div>

      <p
        className={`mt-4 text-center text-slate-500 ${
          isMeeting ? "text-sm" : "text-xs"
        }`}
      >
        Document generated {exportedAt}
      </p>
    </section>
  );
}
