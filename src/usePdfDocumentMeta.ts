import { useCallback, useState } from "react";
import {
  createDefaultPdfMeta,
  loadPdfMeta,
  savePdfMeta,
  type PdfDocumentMeta,
} from "../pdfDocumentMeta";

export function usePdfDocumentMeta() {
  const [meta, setMetaState] = useState<PdfDocumentMeta>(() => loadPdfMeta());

  const setMeta = useCallback((next: PdfDocumentMeta) => {
    setMetaState(next);
    savePdfMeta(next);
  }, []);

  const updateMeta = useCallback((patch: Partial<PdfDocumentMeta>) => {
    setMetaState((prev) => {
      const next = { ...prev, ...patch };
      savePdfMeta(next);
      return next;
    });
  }, []);

  const resetMeta = useCallback(() => {
    const defaults = createDefaultPdfMeta();
    setMeta(defaults);
    return defaults;
  }, [setMeta]);

  return { meta, setMeta, updateMeta, resetMeta };
}
