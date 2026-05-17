import { useCallback, useEffect, useRef, useState } from "react";
import type { PdfDocumentMeta } from "../pdfDocumentMeta";
import type { ColumnId, Note, RowId } from "../types";
import KioskBoard from "./KioskBoard";

interface DisplayModeProps {
  open: boolean;
  pdfMeta: PdfDocumentMeta;
  notesByCell: (rowId: RowId, columnId: ColumnId) => Note[];
  onClose: () => void;
}

export default function DisplayMode({
  open,
  pdfMeta,
  notesByCell,
  onClose,
}: DisplayModeProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  const updateScale = useCallback(() => {
    const viewport = viewportRef.current;
    const content = contentRef.current;
    if (!viewport || !content) return;

    const pad = 48;
    const availW = viewport.clientWidth - pad;
    const availH = viewport.clientHeight - pad;
    const contentW = content.offsetWidth;
    const contentH = content.offsetHeight;
    if (contentW <= 0 || contentH <= 0) return;

    const fit = Math.min(availW / contentW, availH / contentH, 1);
    setScale(Math.max(0.25, fit));
  }, []);

  useEffect(() => {
    if (!open) return;

    updateScale();
    const timer = window.setTimeout(updateScale, 50);

    const ro = new ResizeObserver(updateScale);
    if (viewportRef.current) ro.observe(viewportRef.current);
    window.addEventListener("resize", updateScale);

    return () => {
      window.clearTimeout(timer);
      ro.disconnect();
      window.removeEventListener("resize", updateScale);
    };
  }, [open, updateScale, pdfMeta, notesByCell]);

  useEffect(() => {
    if (!open) return;
    document.body.classList.add("display-mode-active");
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.classList.remove("display-mode-active");
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="kiosk-mode fixed inset-0 z-[100] flex flex-col bg-slate-900"
      role="presentation"
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute right-5 top-5 z-20 rounded-lg border-2 border-white/40 bg-black/50 px-5 py-2.5 text-base font-semibold text-white backdrop-blur-sm transition-colors hover:bg-black/70"
      >
        Exit display (Esc)
      </button>

      <div
        ref={viewportRef}
        className="flex flex-1 items-center justify-center overflow-hidden p-6"
      >
        <div
          ref={contentRef}
          className="will-change-transform"
          style={{
            transform: `scale(${scale})`,
            transformOrigin: "center center",
          }}
        >
          <KioskBoard pdfMeta={pdfMeta} notesByCell={notesByCell} />
        </div>
      </div>
    </div>
  );
}
