import apiClient from "@/lib/axios";

export default async function createExchangeInternal(anything) {
  try {
    const response = await apiClient.post("/api/exchange/createExchangeInternal",anything);
    console.log(response)
    return response.data   
  } catch (err) {
    console.error("خطأ :", err);
    throw new Error("خطأ أثناء إنشاء عملية الصرف الداخلي");
  }
}

export async function getAllExchange() {
  try {
    const response = await apiClient.get("/api/exchange/getAll");
    console.log(response)
    return response.data   
  } catch (err) {
    console.error("خطأ :", err);
    throw new Error("خطأ أثناء جلب الصرفيات");
  }
}

export async function getAllDoneExchange() {
  try {
    const response = await apiClient.get("/api/doneExchange/getAll");
    console.log(response)
    return response.data   
  } catch (err) {
    console.error("خطأ :", err);
    throw new Error("خطأ أثناء جلب الصرفيات المنجزة");
  }
}
