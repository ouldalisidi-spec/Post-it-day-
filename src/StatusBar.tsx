import { useProductionModeContext } from "../context/ProductionModeContext";

interface StatusBarProps {
  boardFileName: string | null;
  isDirty: boolean;
  lastSaved: string | null;
  canSaveInPlace?: boolean;
  className?: string;
}

function formatLastSaved(iso: string | null): string {
  if (!iso) return "Never";
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: "short",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

function SaveIndicator({ isDirty }: { isDirty: boolean }) {
  if (isDirty) {
    return (
      <div
        className="flex items-center gap-2 rounded-md border border-red-300 bg-red-50 px-3 py-1.5"
        role="status"
        aria-live="polite"
      >
        <span
          className="h-3 w-3 shrink-0 rounded-full bg-red-600"
          aria-hidden
        />
        <span className="text-sm font-bold text-red-800">Unsaved changes</span>
      </div>
    );
  }

  return (
    <div
      className="flex items-center gap-2 rounded-md border border-green-300 bg-green-50 px-3 py-1.5"
      role="status"
      aria-live="polite"
    >
      <span
        className="h-3 w-3 shrink-0 rounded-full bg-green-600"
        aria-hidden
      />
      <span className="text-sm font-bold text-green-800">Saved</span>
    </div>
  );
}

export default function StatusBar({
  boardFileName,
  isDirty,
  lastSaved,
  canSaveInPlace = false,
  className = "",
}: StatusBarProps) {
  const { productionMode } = useProductionModeContext();
  const displayName = boardFileName ?? "No file open";

  return (
    <div className={`border-b-2 border-slate-300 bg-slate-100 ${className}`.trim()}>
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 px-4 py-2.5">
        <SaveIndicator isDirty={isDirty} />

        <div className="flex min-w-0 items-center gap-2">
          <span className="shrink-0 text-xs font-semibold uppercase tracking-wide text-slate-500">
            File
          </span>
          <span
            className="truncate text-sm font-semibold text-slate-900"
            title={displayName}
          >
            {displayName}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="shrink-0 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Last saved
          </span>
          <span className="text-sm font-medium text-slate-800">
            {formatLastSaved(lastSaved)}
          </span>
        </div>
      </div>

      {!productionMode && (
        <p className="border-t border-slate-200 px-4 py-2 text-xs text-slate-600">
          {canSaveInPlace
            ? "Save updates the same file on your shared drive (Chrome / Edge)."
            : "Save downloads the file — copy it to your shared network folder for the team."}
        </p>
      )}

      {productionMode && isDirty && (
        <p className="border-t border-slate-200 px-4 py-2 text-sm font-medium text-slate-700">
          Press <span className="font-bold">Save</span> when finished so the
          team sees your changes.
        </p>
      )}
    </div>
  );
}
