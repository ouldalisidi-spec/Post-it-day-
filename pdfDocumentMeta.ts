export interface PdfDocumentMeta {
  boardTitle: string;
  weekNumber: string;
  dateRange: string;
  projectName: string;
  /** @deprecated Use preparedBy — kept for migration */
  exportedBy?: string;
  preparedBy: string;
  reviewedBy: string;
  dateOfIssue: string;
  companyReference: string;
}

export const PDF_META_STORAGE_KEY = "visual-scheduling-board-pdf-meta";

const DEFAULT_TITLE = "Weekly Scheduling Board";

function startOfWeekMonday(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function formatShortDate(date: Date): string {
  return date.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function getIsoWeekNumber(date = new Date()): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

export function getDefaultDateRange(date = new Date()): string {
  const monday = startOfWeekMonday(date);
  const sunday = addDays(monday, 6);
  return `${formatShortDate(monday)} – ${formatShortDate(sunday)}`;
}

export function getDefaultDateOfIssue(date = new Date()): string {
  return formatShortDate(date);
}

export function createDefaultPdfMeta(): PdfDocumentMeta {
  const now = new Date();
  return {
    boardTitle: DEFAULT_TITLE,
    weekNumber: `Week ${getIsoWeekNumber(now)}`,
    dateRange: getDefaultDateRange(now),
    projectName: "",
    preparedBy: "",
    reviewedBy: "",
    dateOfIssue: getDefaultDateOfIssue(now),
    companyReference: "",
  };
}

export function loadPdfMeta(): PdfDocumentMeta {
  try {
    const raw = localStorage.getItem(PDF_META_STORAGE_KEY);
    if (!raw) return createDefaultPdfMeta();
    const parsed = JSON.parse(raw) as Partial<PdfDocumentMeta> & {
      exportedBy?: string;
    };
    const defaults = createDefaultPdfMeta();
    const preparedBy =
      typeof parsed.preparedBy === "string" && parsed.preparedBy.trim()
        ? parsed.preparedBy.trim()
        : typeof parsed.exportedBy === "string"
          ? parsed.exportedBy.trim()
          : defaults.preparedBy;

    return {
      boardTitle:
        typeof parsed.boardTitle === "string" && parsed.boardTitle.trim()
          ? parsed.boardTitle.trim()
          : defaults.boardTitle,
      weekNumber:
        typeof parsed.weekNumber === "string" && parsed.weekNumber.trim()
          ? parsed.weekNumber.trim()
          : defaults.weekNumber,
      dateRange:
        typeof parsed.dateRange === "string" && parsed.dateRange.trim()
          ? parsed.dateRange.trim()
          : defaults.dateRange,
      projectName:
        typeof parsed.projectName === "string" ? parsed.projectName.trim() : "",
      preparedBy,
      reviewedBy:
        typeof parsed.reviewedBy === "string" ? parsed.reviewedBy.trim() : "",
      dateOfIssue:
        typeof parsed.dateOfIssue === "string" && parsed.dateOfIssue.trim()
          ? parsed.dateOfIssue.trim()
          : defaults.dateOfIssue,
      companyReference:
        typeof parsed.companyReference === "string"
          ? parsed.companyReference.trim()
          : "",
    };
  } catch {
    return createDefaultPdfMeta();
  }
}

export function savePdfMeta(meta: PdfDocumentMeta): void {
  const { exportedBy: _omit, ...payload } = meta;
  localStorage.setItem(PDF_META_STORAGE_KEY, JSON.stringify(payload));
}

export function formatPdfExportTimestamp(date = new Date()): string {
  return date.toLocaleString(undefined, {
    dateStyle: "full",
    timeStyle: "short",
  });
}

export function normalizePdfMetaForExport(
  draft: PdfDocumentMeta,
): PdfDocumentMeta {
  const defaults = createDefaultPdfMeta();
  return {
    boardTitle: draft.boardTitle.trim() || defaults.boardTitle,
    weekNumber: draft.weekNumber.trim() || defaults.weekNumber,
    dateRange: draft.dateRange.trim() || defaults.dateRange,
    projectName: draft.projectName.trim(),
    preparedBy: draft.preparedBy.trim(),
    reviewedBy: draft.reviewedBy.trim(),
    dateOfIssue: draft.dateOfIssue.trim() || defaults.dateOfIssue,
    companyReference: draft.companyReference.trim(),
  };
}
