import { useRef } from "react";
import { useProductionModeContext } from "../context/ProductionModeContext";
import { supportsFileSystemAccess } from "../sharedFile";
import ProductionModeToggle from "./ProductionModeToggle";

interface ToolbarProps {
  noteCount: number;
  isDirty: boolean;
  canSaveInPlace: boolean;
  onAddNote: () => void;
  onClearBoard: () => void;
  onSave: () => void;
  onOpenBoard: () => void;
  onLoadOpenFile: () => void;
  onLoadUpload: (file: File) => Promise<void>;
  onChangeFile: () => void;
  onExportPdf: () => void;
  isExportingPdf?: boolean;
  onMeetingExport: () => void;
  onPrintBoard: () => void;
  onDisplayMode: () => void;
}

export default function Toolbar({
  noteCount,
  isDirty,
  canSaveInPlace,
  onAddNote,
  onClearBoard,
  onSave,
  onOpenBoard,
  onLoadOpenFile,
  onLoadUpload,
  onChangeFile,
  onExportPdf,
  isExportingPdf = false,
  onMeetingExport,
  onPrintBoard,
  onDisplayMode,
}: ToolbarProps) {
  const { productionMode } = useProductionModeContext();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await onLoadUpload(file);
    e.target.value = "";
  };

  const btnBase =
    "rounded border-2 px-5 py-3 text-base font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-white/50";

  const handleOpenProduction = () => {
    if (supportsFileSystemAccess()) {
      void onOpenBoard();
    } else {
      fileInputRef.current?.click();
    }
  };

  return (
    <header className="screen-only border-b-4 border-slate-700 bg-board-header text-white shadow-md">
      <div className="flex flex-wrap items-center justify-between gap-4 px-4 py-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight md:text-2xl">
            Scheduling Board
          </h1>
          <p className="mt-1 text-sm text-white/85">
            {productionMode
              ? "Weekly planning board"
              : `${noteCount} task${noteCount === 1 ? "" : "s"}`}
          </p>
        </div>

        <nav className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onAddNote}
            className={`${btnBase} border-orange-400 bg-board-accent hover:bg-orange-700`}
          >
            {productionMode ? "+ Add task" : "+ Add note"}
          </button>

          <button
            type="button"
            onClick={onSave}
            className={`${btnBase} ${
              isDirty
                ? "border-green-400 bg-green-700 hover:bg-green-800"
                : "border-white/40 bg-white/15 hover:bg-white/25"
            }`}
          >
            {productionMode
              ? canSaveInPlace
                ? "Save"
                : "Save to file"
              : canSaveInPlace
                ? "Save board (same file)"
                : "Save board (download JSON)"}
          </button>

          <button
            type="button"
            onClick={productionMode ? handleOpenProduction : onLoadOpenFile}
            className={`${btnBase} border-white/40 bg-white/15 hover:bg-white/25`}
          >
            {productionMode ? "Open board" : "Load board (open file)"}
          </button>

          <button
            type="button"
            onClick={onExportPdf}
            disabled={isExportingPdf}
            className={`${btnBase} border-white/40 bg-white/15 hover:bg-white/25 disabled:cursor-wait disabled:opacity-60`}
          >
            {isExportingPdf
              ? "Exporting…"
              : productionMode
                ? "Export PDF"
                : "Export to PDF"}
          </button>

          <button
            type="button"
            onClick={onMeetingExport}
            className={`${btnBase} border-sky-300/60 bg-sky-800/80 hover:bg-sky-800`}
          >
            {productionMode ? "Meeting view" : "Meeting export"}
          </button>

          <button
            type="button"
            onClick={onPrintBoard}
            className={`${btnBase} border-white/40 bg-white/15 hover:bg-white/25`}
          >
            {productionMode ? "Print" : "Print board"}
          </button>

          <button
            type="button"
            onClick={onDisplayMode}
            className={`${btnBase} border-violet-300/70 bg-violet-900/90 hover:bg-violet-800`}
          >
            Display mode
          </button>

          {!productionMode && (
            <>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className={`${btnBase} border-white/40 bg-white/15 hover:bg-white/25`}
              >
                Load board (upload JSON)
              </button>
              <button
                type="button"
                onClick={onChangeFile}
                className={`${btnBase} border-white/30 bg-transparent text-sm hover:bg-white/10`}
              >
                Change file
              </button>
              <button
                type="button"
                onClick={onClearBoard}
                className={`${btnBase} border-red-400/60 text-red-100 hover:bg-red-900/40`}
              >
                Clear board
              </button>
            </>
          )}

          {productionMode ? (
            <ProductionModeToggle compact />
          ) : (
            <ProductionModeToggle />
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            className="hidden"
            onChange={handleUpload}
          />
        </nav>
      </div>
    </header>
  );
}
