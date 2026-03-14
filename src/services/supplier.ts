import apiClient from "@/lib/axios";

export default async function getAllSupplier() {
  try {
    const response = await apiClient.get("/api/suppliers");
    return response.data;
  } catch (err) {
    console.error("خطأ في تسجيل الدخول:", err);
    throw new Error("خطأ أثناء جلب الموردين");
  }
}
export async function addSupplier({ name, number }) {
  try {
    const response = await apiClient.post("/api/suppliers", {
      name,
      number,
    });
    return response.data;
  } catch (err) {
    console.error("خطأ في تسجيل الدخول:", err);
    throw new Error("خطأ أثناء إضافة مورد جديد");
  }
}

export async function getSupplierById({ id }: { id: string }) {
  try {
    console.log("frontend id:", id);
    const response = await apiClient.post("/api/suppliers/byId", { id });
    return response.data;
  } catch (err) {
    console.error("خطأ في جلب المورد:", err);
    throw new Error("خطأ أثناء جلب المورد بواسطة المعرف");
  }
}


export async function updateSupplier(id: string, data: Partial<any>) {
  try {
    const response = await apiClient.put(`/api/suppliers/${id}`, {name: data.name, number: data.number});
    return response.data;
  } catch (err) {
    console.error("خطأ في تحديث العميل:", err);
    throw new Error("خطأ أثناء تحديث بيانات العميل");
  }
}
