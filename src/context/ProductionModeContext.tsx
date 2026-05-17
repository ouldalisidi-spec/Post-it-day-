import { createContext, useContext, type ReactNode } from "react";

interface ProductionModeContextValue {
  productionMode: boolean;
  setProductionMode: (value: boolean) => void;
  toggleProductionMode: () => void;
}

export const ProductionModeContext =
  createContext<ProductionModeContextValue | null>(null);

export function ProductionModeProvider({
  value,
  children,
}: {
  value: ProductionModeContextValue;
  children: ReactNode;
}) {
  return (
    <ProductionModeContext.Provider value={value}>
      {children}
    </ProductionModeContext.Provider>
  );
}

export function useProductionModeContext(): ProductionModeContextValue {
  const ctx = useContext(ProductionModeContext);
  if (!ctx) {
    throw new Error("useProductionModeContext must be used within provider");
  }
  return ctx;
}
