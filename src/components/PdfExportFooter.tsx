import type { PdfDocumentMeta } from "../pdfDocumentMeta";
import PdfColorLegend from "./PdfColorLegend";
import PdfSignatureSection from "./PdfSignatureSection";

interface PdfExportFooterProps {
  meta: PdfDocumentMeta;
  variant?: "board" | "meeting";
}

export default function PdfExportFooter({
  meta,
  variant = "board",
}: PdfExportFooterProps) {
  const isMeeting = variant === "meeting";

  return (
    <footer className="pdf-export-footer border-t-4 border-slate-300 bg-slate-50">
      <PdfSignatureSection meta={meta} variant={variant} />
      <PdfColorLegend variant={isMeeting ? "meeting" : "default"} />
    </footer>
  );
}
