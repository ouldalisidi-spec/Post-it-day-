import { useProductionModeContext } from "../context/ProductionModeContext";
import {
  NOTE_COLOR_MEANINGS,
  NOTE_COLOR_PICKER_SWATCHES,
} from "../noteColors";
import type { BoardFilters } from "../noteFilters";
import { hasActiveBoardFilters } from "../noteFilters";
import type { NoteColor } from "../types";
import { NOTE_COLORS } from "../types";

interface BoardFilterBarProps {
  filters: BoardFilters;
  totalNotes: number;
  visibleNotes: number;
  onChange: (filters: BoardFilters) => void;
  onClear: () => void;
  className?: string;
}

const COLOR_LABELS: Record<NoteColor, string> = {
  yellow: "Ongoing",
  green: "Done",
  red: "Delay",
};

export default function BoardFilterBar({
  filters,
  totalNotes,
  visibleNotes,
  onChange,
  onClear,
  className = "",
}: BoardFilterBarProps) {
  const { productionMode } = useProductionModeContext();
  const active = hasActiveBoardFilters(filters);

  const toggleColor = (color: NoteColor) => {
    onChange({
      ...filters,
      colors: { ...filters.colors, [color]: !filters.colors[color] },
    });
  };

  return (
    <div
      className={`screen-only border-b border-slate-300 bg-white ${className}`.trim()}
    >
      <div className="flex flex-wrap items-end gap-4 px-4 py-3">
        <div className="min-w-[200px] flex-1">
          <label
            htmlFor="filter-by-name"
            className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500"
          >
            {productionMode ? "Filter by name" : "Filter by person"}
          </label>
          <input
            id="filter-by-name"
            type="search"
            value={filters.nameQuery}
            onChange={(e) =>
              onChange({ ...filters, nameQuery: e.target.value })
            }
            placeholder={
              productionMode ? "Responsible person…" : "Author name…"
            }
            className="w-full max-w-md rounded border border-board-line px-3 py-2 text-sm outline-none focus:border-board-header focus:ring-1 focus:ring-board-header"
            autoComplete="off"
          />
        </div>

        <fieldset className="border-0 p-0">
          <legend className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
            {productionMode ? "Status" : "Filter by color"}
          </legend>
          <div className="flex flex-wrap gap-2">
            {NOTE_COLORS.map((color) => {
              const on = filters.colors[color];
              return (
                <button
                  key={color}
                  type="button"
                  onClick={() => toggleColor(color)}
                  aria-pressed={on}
                  className={`flex items-center gap-2 rounded-md border-2 px-3 py-1.5 text-sm font-semibold transition-colors ${
                    on
                      ? `${NOTE_COLOR_PICKER_SWATCHES[color]} border-slate-600 text-slate-900`
                      : "border-slate-200 bg-slate-50 text-slate-400 line-through"
                  }`}
                  title={`${COLOR_LABELS[color]} (${NOTE_COLOR_MEANINGS[color]})`}
                >
                  <span
                    className={`h-4 w-4 rounded-sm border ${NOTE_COLOR_PICKER_SWATCHES[color]}`}
                    aria-hidden
                  />
                  {COLOR_LABELS[color]}
                </button>
              );
            })}
          </div>
        </fieldset>

        <div className="flex flex-wrap items-center gap-3 pb-0.5">
          {active ? (
            <p className="text-sm text-slate-600">
              Showing{" "}
              <span className="font-bold text-slate-900">{visibleNotes}</span> of{" "}
              {totalNotes} task{totalNotes === 1 ? "" : "s"}
            </p>
          ) : (
            <p className="text-sm text-slate-500">
              {totalNotes} task{totalNotes === 1 ? "" : "s"} on board
            </p>
          )}
          {active ? (
            <button
              type="button"
              onClick={onClear}
              className="rounded border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Clear filters
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
