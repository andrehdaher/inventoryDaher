import apiClient from "@/lib/axios";

export default async function getAllSells() {
  try {
    const response = await apiClient.get("/api/sells");

    return response.data;
  } catch (err) {
    console.error("خطأ في حلب البيانات:", err);
    throw new Error("خطأ أثناء جلب البيانات");
  }
}

export async function getAllSellById(id: string) {
  try {
    const response = await apiClient.get(`/api/sells/${id}`);
    return response.data;
  } catch (err) {
    console.error("خطأ في حلب البيانات:", err);
    throw new Error("خطأ أثناء جلب البيانات");
  }
}

export async function updateSellById(id: string, data: any) {
  try {
    const response = await apiClient.put(`/api/sells/${id}`, data);
    console.log(id, data);
    return response.data;
  } catch (err) {
    console.error("خطأ في تحديث الفاتورة:", err);
    throw new Error("حدث خطأ أثناء تحديث الفاتورة");
  }
}

export async function deleteSellById(id: string, data: any) {
  try {
    const response = await apiClient.delete(`/api/sells/${id}`, data);
    console.log(id, data);
    return response.data;
  } catch (err) {
    console.error("خطأ في تحديث الفاتورة:", err);
    throw new Error("حدث خطأ أثناء تحديث الفاتورة");
  }
}
