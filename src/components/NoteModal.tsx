import { useEffect, useRef, useState } from "react";
import { useProductionModeContext } from "../context/ProductionModeContext";
import type { ColumnId, Note, NoteFormData, NoteColor, RowId } from "../types";
import { COLUMNS, NOTE_COLORS, ROWS } from "../types";
import {
  NOTE_COLOR_MEANINGS,
  NOTE_COLOR_PICKER_SWATCHES,
  normalizeNoteColor,
} from "../noteColors";
interface NoteModalProps {
  open: boolean;
  mode: "create" | "edit";
  initial?: Partial<Note>;
  onClose: () => void;
  onSave: (data: NoteFormData) => void;
}

export default function NoteModal({
  open,
  mode,
  initial,
  onClose,
  onSave,
}: NoteModalProps) {
  const { productionMode } = useProductionModeContext();
  const [text, setText] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [color, setColor] = useState<NoteColor>("yellow");
  const [rowId, setRowId] = useState<RowId>("SPI");
  const [columnId, setColumnId] = useState<ColumnId>("MO");
  const [dueDate, setDueDate] = useState("");
  const [error, setError] = useState("");
  const textRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!open) return;
    setText(initial?.text ?? "");
    setAuthorName(initial?.authorName ?? "");
    setColor(
      initial?.color ? normalizeNoteColor(String(initial.color)) : "yellow",
    );
    setRowId(initial?.rowId ?? "SPI");
    setColumnId(initial?.columnId ?? "MO");
    setDueDate(initial?.dueDate ?? "");
    setError("");
    requestAnimationFrame(() => textRef.current?.focus());
  }, [open, initial]);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = authorName.trim();
    if (!trimmedName) {
      setError("Name is required. Enter the person responsible for this task.");
      return;
    }
    onSave({
      text: text.trim(),
      authorName: trimmedName,
      color,
      columnId,
      rowId,
      dueDate: dueDate.trim() || undefined,
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="note-modal-title"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-lg border border-board-line bg-white shadow-xl"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <header className="border-b border-board-line px-5 py-4">
          <h2
            id="note-modal-title"
            className="text-lg font-semibold text-slate-800"
          >
            {productionMode
              ? mode === "create"
                ? "Add task"
                : "Change task"
              : mode === "create"
                ? "New task note"
                : "Edit task note"}
          </h2>
        </header>

        <div className="space-y-4 px-5 py-4">
          <fieldset className="border-0 p-0">
            <label
              htmlFor="note-author"
              className="mb-1 block text-sm font-medium text-slate-700"
            >
              {productionMode ? "Your name" : "Name (required)"}{" "}
              <span className="text-red-600">*</span>
            </label>
            <input
              id="note-author"
              type="text"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              placeholder={
                productionMode ? "Who is responsible?" : "Your name — person responsible"
              }
              required
              className="w-full rounded border border-board-line px-3 py-2 text-sm outline-none focus:border-board-header focus:ring-1 focus:ring-board-header"
              autoComplete="name"
            />
          </fieldset>

          <fieldset className="border-0 p-0">
            <label
              htmlFor="note-text"
              className="mb-1 block text-sm font-medium text-slate-700"
            >
              {productionMode ? "What to do" : "Task description"}
            </label>
            <textarea
              id="note-text"
              ref={textRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={4}
              placeholder={
                productionMode ? "Describe the task…" : "What needs to be done?"
              }
              className="w-full resize-y rounded border border-board-line px-3 py-2 text-sm outline-none focus:border-board-header focus:ring-1 focus:ring-board-header"
            />
          </fieldset>

          <fieldset className="border-0 p-0">
            <label
              htmlFor="note-due-date"
              className="mb-1 block text-sm font-medium text-slate-700"
            >
              {productionMode ? "Due date (optional)" : "Due date (optional)"}
            </label>
            <div className="flex flex-wrap items-center gap-2">
              <input
                id="note-due-date"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="rounded border border-board-line px-3 py-2 text-sm outline-none focus:border-board-header focus:ring-1 focus:ring-board-header"
              />
              {dueDate ? (
                <button
                  type="button"
                  onClick={() => setDueDate("")}
                  className="rounded border border-board-line px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  Clear date
                </button>
              ) : null}
            </div>
          </fieldset>

          <fieldset className="border-0 p-0">
            <legend className="mb-2 text-sm font-medium text-slate-700">
              {productionMode ? "Note colour" : "Color"}
            </legend>
            <div className="flex flex-wrap gap-2">
              {NOTE_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`h-9 w-9 rounded-md border-2 transition-transform ${NOTE_COLOR_PICKER_SWATCHES[c]} ${
                    color === c
                      ? "scale-110 border-slate-700 ring-2 ring-slate-400"
                      : "border-transparent opacity-80 hover:opacity-100"
                  }`}
                  title={`${c} — ${NOTE_COLOR_MEANINGS[c]}`}
                  aria-label={`${c}: ${NOTE_COLOR_MEANINGS[c]}`}
                  aria-pressed={color === c}
                />
              ))}
            </div>
            <p className="mt-2 text-xs text-slate-600">
              Green = Done · Yellow = Ongoing · Red = Delay
            </p>
          </fieldset>

          {mode === "create" && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="note-row"
                  className="mb-1 block text-sm font-medium text-slate-700"
                >
                  {productionMode ? "Area" : "Category"}
                </label>
                <select
                  id="note-row"
                  value={rowId}
                  onChange={(e) => setRowId(e.target.value as RowId)}
                  className="w-full rounded border border-board-line px-3 py-2 text-sm outline-none focus:border-board-header"
                >
                  {ROWS.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  htmlFor="note-col"
                  className="mb-1 block text-sm font-medium text-slate-700"
                >
                  Day
                </label>
                <select
                  id="note-col"
                  value={columnId}
                  onChange={(e) => setColumnId(e.target.value as ColumnId)}
                  className="w-full rounded border border-board-line px-3 py-2 text-sm outline-none focus:border-board-header"
                >
                  {COLUMNS.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label} ({c.short})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {error && (
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
          )}
        </div>

        <footer className="flex justify-end gap-2 border-t border-board-line px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded border border-board-line px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded bg-board-header px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-700"
          >
            {productionMode
              ? mode === "create"
                ? "Add"
                : "Save"
              : mode === "create"
                ? "Add note"
                : "Save changes"}
          </button>
        </footer>
      </form>
    </div>
  );
}
