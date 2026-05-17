import { useProductionModeContext } from "../context/ProductionModeContext";
import { supportsFileSystemAccess } from "../sharedFile";
import ProductionModeToggle from "./ProductionModeToggle";

interface StartScreenProps {
  onLoadFile: () => void;
  onUploadFile: () => void;
  onStartEmpty: () => void;
}

export default function StartScreen({
  onLoadFile,
  onUploadFile,
  onStartEmpty,
}: StartScreenProps) {
  const { productionMode } = useProductionModeContext();

  const primaryOpen = () => {
    if (supportsFileSystemAccess()) {
      void onLoadFile();
    } else {
      onUploadFile();
    }
  };

  if (productionMode) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center bg-slate-200 p-6">
        <div className="w-full max-w-lg rounded-lg border-2 border-slate-400 bg-white p-10 shadow-md">
          <h2 className="text-3xl font-bold text-slate-900">Start planning</h2>
          <p className="mt-4 text-lg leading-relaxed text-slate-700">
            Open the team board file from your shared folder. When you are
            done, press Save so everyone sees your updates.
          </p>

          <button
            type="button"
            onClick={primaryOpen}
            className="mt-10 w-full rounded border-2 border-board-header bg-board-header py-5 text-xl font-bold text-white hover:bg-slate-800"
          >
            Open board file
          </button>

          <div className="mt-6 flex justify-center">
            <ProductionModeToggle compact variant="panel" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 items-center justify-center bg-slate-200 p-6">
      <div className="w-full max-w-xl rounded-lg border-2 border-slate-400 bg-white p-8 shadow-md">
        <h2 className="text-2xl font-bold text-slate-900">Open team board</h2>
        <p className="mt-3 text-base leading-relaxed text-slate-700">
          Load the shared JSON file from your company network folder. All
          changes are saved back to that file for the rest of the team.
        </p>

        <ol className="mt-6 space-y-2 text-sm text-slate-600">
          <li>1. Load the board file from the shared drive</li>
          <li>2. Plan and move task notes on the grid</li>
          <li>3. Save the file back to the shared drive when done</li>
        </ol>

        <div className="mt-8 flex flex-col gap-3">
          {supportsFileSystemAccess() && (
            <button
              type="button"
              onClick={onLoadFile}
              className="w-full rounded border-2 border-board-header bg-board-header py-4 text-lg font-semibold text-white hover:bg-slate-800"
            >
              Load board (open file)
            </button>
          )}
          <button
            type="button"
            onClick={onUploadFile}
            className="w-full rounded border-2 border-board-header bg-white py-4 text-lg font-semibold text-board-header hover:bg-slate-50"
          >
            Load board (upload JSON)
          </button>
          <button
            type="button"
            onClick={onStartEmpty}
            className="w-full rounded border-2 border-slate-300 py-3 text-base font-medium text-slate-600 hover:bg-slate-50"
          >
            Start empty board
          </button>
        </div>

        <div className="mt-6 border-t border-slate-200 pt-4">
          <ProductionModeToggle variant="panel" />
        </div>

        <p className="mt-4 text-xs text-slate-500">
          No login required. Use one shared file per team (e.g.{" "}
          <span className="font-mono">scheduling-board.json</span> on the
          network drive).
        </p>
      </div>
    </div>
  );
}
