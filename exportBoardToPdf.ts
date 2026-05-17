import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

const DEFAULT_ROOT_ID = "board-export-root";

function prepareCloneForExport(clonedRoot: HTMLElement): void {
  clonedRoot.querySelectorAll<HTMLElement>(".pdf-hide").forEach((el) => {
    el.style.display = "none";
  });

  clonedRoot.querySelectorAll<HTMLElement>("[data-cell-inner]").forEach((el) => {
    el.style.maxHeight = "none";
    el.style.overflow = "visible";
    el.style.height = "auto";
  });

  clonedRoot.querySelectorAll<HTMLElement>("[data-board-scroll]").forEach((el) => {
    el.style.overflow = "visible";
    el.style.maxHeight = "none";
  });

  clonedRoot.style.overflow = "visible";
  clonedRoot.style.width = `${clonedRoot.scrollWidth}px`;

  clonedRoot.querySelectorAll<HTMLElement>(".ring-2").forEach((el) => {
    el.classList.remove("ring-2", "ring-inset", "ring-sky-500");
  });
}

function buildPdfFilename(
  baseName: string,
  suffix?: string,
): string {
  const stem = baseName.replace(/\.json$/i, "") || "scheduling-board";
  const stamp = new Date().toISOString().slice(0, 10);
  const tag = suffix ? `-${suffix}` : "";
  return `${stem}${tag}-${stamp}.pdf`;
}

export interface PdfExportOptions {
  suffix?: string;
  rootId?: string;
}

export async function exportElementToPdf(
  sourceElement: HTMLElement,
  boardFileName: string | null,
  options?: PdfExportOptions,
): Promise<void> {
  const rootId = options?.rootId ?? DEFAULT_ROOT_ID;
  document.body.classList.add("pdf-exporting");

  try {
    const scale = Math.min(2, window.devicePixelRatio || 1.5);

    const canvas = await html2canvas(sourceElement, {
      scale,
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
      width: sourceElement.scrollWidth,
      height: sourceElement.scrollHeight,
      windowWidth: sourceElement.scrollWidth,
      windowHeight: sourceElement.scrollHeight,
      onclone: (clonedDoc) => {
        const clonedRoot = clonedDoc.getElementById(rootId);
        if (clonedRoot) {
          clonedRoot.classList.add("executive-pdf-capture");
          prepareCloneForExport(clonedRoot);
        }
      },
    });

    const imgWidthPx = canvas.width;
    const imgHeightPx = canvas.height;

    const orientation = imgWidthPx >= imgHeightPx ? "landscape" : "portrait";
    const pdf = new jsPDF({
      orientation,
      unit: "mm",
      format: "a3",
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 8;
    const contentWidth = pageWidth - margin * 2;
    const pageContentHeight = pageHeight - margin * 2;

    let offsetYPx = 0;
    let pageIndex = 0;

    while (offsetYPx < imgHeightPx) {
      if (pageIndex > 0) pdf.addPage(orientation);

      const sliceHeightPx = Math.min(
        (pageContentHeight * imgWidthPx) / contentWidth,
        imgHeightPx - offsetYPx,
      );

      const sliceCanvas = document.createElement("canvas");
      sliceCanvas.width = imgWidthPx;
      sliceCanvas.height = sliceHeightPx;
      const ctx = sliceCanvas.getContext("2d");
      if (!ctx) throw new Error("Could not create PDF slice");

      ctx.drawImage(
        canvas,
        0,
        offsetYPx,
        imgWidthPx,
        sliceHeightPx,
        0,
        0,
        imgWidthPx,
        sliceHeightPx,
      );

      const sliceData = sliceCanvas.toDataURL("image/png", 1.0);
      const renderHeightMm = (sliceHeightPx * contentWidth) / imgWidthPx;

      pdf.addImage(
        sliceData,
        "PNG",
        margin,
        margin,
        contentWidth,
        renderHeightMm,
      );

      offsetYPx += sliceHeightPx;
      pageIndex += 1;
    }

    pdf.save(
      buildPdfFilename(boardFileName ?? "scheduling-board", options?.suffix),
    );
  } finally {
    document.body.classList.remove("pdf-exporting");
  }
}

/** @deprecated Use exportElementToPdf */
export async function exportBoardToPdf(
  sourceElement: HTMLElement,
  boardFileName: string | null,
): Promise<void> {
  return exportElementToPdf(sourceElement, boardFileName, {
    rootId: DEFAULT_ROOT_ID,
  });
}
