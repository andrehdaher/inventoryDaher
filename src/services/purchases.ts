import apiClient from "@/lib/axios";

export default async function getAllPurchases() {
  try {
    const response = await apiClient.get("/api/purchases");

    return response.data;
  } catch (err) {
    console.error("خطأ في تسجيل الدخول:", err);
    throw new Error("خطأ أثناء جلب المشتريات");
  }
}
export async function addPurchases({
  name,
  code,
  price,
  quantity,
  total,
  status,
}) {
  try {
    const response = await apiClient.post("/api/purchases", {
      name,
      code,
      price,
      quantity,
      total,
      status,
    });
    return response.data;
  } catch (err) {
    console.error("خطأ في تسجيل الدخول:", err);
    throw new Error("خطأ أثناء إضافة مشتريات جديدة");
  }
}
