import { createContext, useContext } from "react";
import { useProducts } from "@/hooks/useProducts";

type ProductContextType = ReturnType<typeof useProducts>;

const ProductContext = createContext<ProductContextType | null>(null);

export function ProductProvider({ children }) {
  const productsQuery = useProducts();

  return (
    <ProductContext.Provider value={productsQuery}>
      {children}
    </ProductContext.Provider>
  );
}

export function useProductContext() {
  return useContext(ProductContext);
}
