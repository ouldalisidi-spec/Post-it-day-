import { useMemo } from "react";
import { useProductionModeContext } from "../context/ProductionModeContext";
import { computeBoardStats } from "../boardStats";
import {
  NOTE_COLOR_MEANINGS,
  NOTE_COLOR_PICKER_SWATCHES,
} from "../noteColors";
import type { Note } from "../types";

interface BoardDashboardProps {
  notes: Note[];
  className?: string;
}

function StatCard({
  label,
  value,
  accentClass,
  swatchClass,
}: {
  label: string;
  value: number;
  accentClass: string;
  swatchClass?: string;
}) {
  return (
    <div
      className={`flex min-w-[5.5rem] flex-col rounded-lg border-2 px-3 py-2 ${accentClass}`}
    >
      <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-600">
        {swatchClass ? (
          <span
            className={`h-2.5 w-2.5 shrink-0 rounded-sm border ${swatchClass}`}
            aria-hidden
          />
        ) : null}
        {label}
      </span>
      <span className="mt-0.5 text-2xl font-bold tabular-nums text-slate-900">
        {value}
      </span>
    </div>
  );
}

export default function BoardDashboard({
  notes,
  className = "",
}: BoardDashboardProps) {
  const { productionMode } = useProductionModeContext();
  const stats = useMemo(() => computeBoardStats(notes), [notes]);
  const taskLabel = productionMode ? "tasks" : "notes";

  return (
    <section
      className={`screen-only border-b border-slate-300 bg-slate-50 ${className}`.trim()}
      aria-label="Board summary"
    >
      <div className="flex flex-wrap items-stretch gap-3 px-4 py-3">
        <StatCard
          label="Total"
          value={stats.total}
          accentClass="border-slate-300 bg-white"
        />
        <StatCard
          label={NOTE_COLOR_MEANINGS.green}
          value={stats.done}
          accentClass="border-emerald-300 bg-emerald-50/80"
          swatchClass={NOTE_COLOR_PICKER_SWATCHES.green}
        />
        <StatCard
          label={NOTE_COLOR_MEANINGS.yellow}
          value={stats.ongoing}
          accentClass="border-amber-300 bg-amber-50/80"
          swatchClass={NOTE_COLOR_PICKER_SWATCHES.yellow}
        />
        <StatCard
          label={NOTE_COLOR_MEANINGS.red}
          value={stats.delayed}
          accentClass="border-red-300 bg-red-50/80"
          swatchClass={NOTE_COLOR_PICKER_SWATCHES.red}
        />

        <div className="flex min-w-[10rem] flex-1 flex-col justify-center rounded-lg border-2 border-board-header/30 bg-white px-4 py-2">
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-600">
              Completion
            </span>
            <span className="text-2xl font-bold tabular-nums text-board-header">
              {stats.completionPercent}%
            </span>
          </div>
          <div
            className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200"
            role="progressbar"
            aria-valuenow={stats.completionPercent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`${stats.completionPercent}% of ${taskLabel} done`}
          >
            <div
              className="h-full rounded-full bg-emerald-500 transition-[width] duration-300"
              style={{ width: `${stats.completionPercent}%` }}
            />
          </div>
          <p className="mt-1 text-xs text-slate-500">
            {stats.done} of {stats.total} {taskLabel} marked done
          </p>
        </div>
      </div>
    </section>
  );
}
