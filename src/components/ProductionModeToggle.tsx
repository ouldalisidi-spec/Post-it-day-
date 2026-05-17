import { useProductionModeContext } from "../context/ProductionModeContext";

interface ProductionModeToggleProps {
  compact?: boolean;
  variant?: "header" | "panel";
}

export default function ProductionModeToggle({
  compact = false,
  variant = "header",
}: ProductionModeToggleProps) {
  const { productionMode, setProductionMode } = useProductionModeContext();

  if (compact) {
    const linkClass =
      variant === "panel"
        ? "text-base font-medium text-board-header underline-offset-2 hover:underline"
        : "text-sm font-medium text-white/80 underline-offset-2 hover:text-white hover:underline";

    return (
      <button type="button" onClick={() => setProductionMode(false)} className={linkClass}>
        Advanced options…
      </button>
    );
  }

  const boxClass =
    variant === "panel"
      ? "border-2 border-slate-300 bg-slate-50"
      : "border-2 border-white/25 bg-white/10";

  const subClass = variant === "panel" ? "text-slate-500" : "text-white/75";
  const titleClass = variant === "panel" ? "text-slate-800" : "";

  return (
    <label
      className={`flex cursor-pointer items-center gap-3 rounded px-4 py-2.5 ${boxClass}`}
    >
      <input
        type="checkbox"
        checked={productionMode}
        onChange={(e) => setProductionMode(e.target.checked)}
        className="h-5 w-5 accent-board-accent"
      />
      <span className={`text-left leading-tight ${titleClass}`}>
        <span className="block text-sm font-semibold">Production mode</span>
        <span className={`block text-xs ${subClass}`}>
          {productionMode
            ? "Simple view for daily field use"
            : "All options visible"}
        </span>
      </span>
    </label>
  );
}
