import { useCallback, useState } from "react";

const STORAGE_KEY = "visual-scheduling-board-production-mode";

function readInitial(): boolean {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) return true;
    return raw === "true";
  } catch {
    return true;
  }
}

export function useProductionMode() {
  const [productionMode, setProductionModeState] = useState(readInitial);

  const setProductionMode = useCallback((value: boolean) => {
    setProductionModeState(value);
    try {
      localStorage.setItem(STORAGE_KEY, String(value));
    } catch {
      /* ignore */
    }
  }, []);

  const toggleProductionMode = useCallback(() => {
    setProductionMode(!productionMode);
  }, [productionMode, setProductionMode]);

  return { productionMode, setProductionMode, toggleProductionMode };
}
