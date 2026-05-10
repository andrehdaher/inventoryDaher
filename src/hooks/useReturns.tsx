// hooks/useReturns.ts
import { queryKeys } from "@/lib/queryKeys";
import getAllReturn from "@/services/return";
import { useQuery, UseQueryResult } from "@tanstack/react-query";

export interface Return {
  id: number | string;
  productId?: string;
  productName?: string;
  productCode?: string;
  product?: {
    name?: string;
    code?: string;
  };
  name?: string;
  code?: string;
  warehouse?: string;
  quantity?: number | string;
  qty?: number | string;
  reason?: string;
  date?: string;
  createdDate?: string;
  createdAt?: string;
  customerId?: string;
  customerName?: string;
  customer?: {
    name?: string;
  };
  supplierId?: string;
  supplierName?: string;
  supplier?: {
    name?: string;
  };
  invoiceNumber?: string;
  referenceId?: string;
  sellId?: number | string;
  purchaseId?: number | string;
  totalPrice?: number | string;
  returnValue?: number | string;
  returnSource?: "customer" | "supplier" | string;
}

export function useReturns(): UseQueryResult<Return[], Error> {
  return useQuery<Return[], Error>({
    queryKey: queryKeys.returns,
    queryFn: getAllReturn,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
}
