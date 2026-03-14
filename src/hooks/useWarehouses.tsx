// hooks/useWarehouses.ts
import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { getAllWarehouses, Warehouse } from "@/services/warehouse";

export function useWarehouses(): UseQueryResult<Warehouse[], Error> {
  return useQuery<Warehouse[], Error>({
    queryKey: ["warehouses-table"],
    queryFn: getAllWarehouses,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
}
