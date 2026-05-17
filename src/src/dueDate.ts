const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export function normalizeDueDate(value: unknown): string | undefined {
  if (typeof value !== "string" || !value.trim()) return undefined;
  const trimmed = value.trim();
  if (!ISO_DATE.test(trimmed)) return undefined;
  const parsed = new Date(`${trimmed}T12:00:00`);
  if (Number.isNaN(parsed.getTime())) return undefined;
  return trimmed;
}

export function formatDueDate(isoDate: string): string {
  try {
    return new Date(`${isoDate}T12:00:00`).toLocaleDateString(undefined, {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return isoDate;
  }
}

export function isDueDateOverdue(isoDate: string): boolean {
  const due = normalizeDueDate(isoDate);
  if (!due) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dueDay = new Date(`${due}T00:00:00`);
  return dueDay < today;
}
