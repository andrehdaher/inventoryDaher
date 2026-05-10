import apiClient from "@/lib/axios";

const normalizeReturns = (data: any) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.returns)) return data.returns;

  const customerReturns = data?.customerReturns || data?.data?.customerReturns;
  const supplierReturns = data?.supplierReturns || data?.data?.supplierReturns;

  if (Array.isArray(customerReturns) || Array.isArray(supplierReturns)) {
    return [
      ...(customerReturns || []).map((item: any) => ({
        ...item,
        returnSource: item.returnSource || "customer",
      })),
      ...(supplierReturns || []).map((item: any) => ({
        ...item,
        returnSource: item.returnSource || "supplier",
      })),
    ];
  }

  return [];
};

export default async function getAllReturn() {
  const res = await apiClient.get("/api/returns/");
  console.log("API Response for Returns:", res.data);   
  return normalizeReturns(res.data);
}
