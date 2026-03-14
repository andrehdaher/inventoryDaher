import apiClient from "@/lib/axios";

export default async function getAllProducts() {
  try {
    const response = await apiClient.get("/api/products");
    return response.data;
  } catch (err) {
    console.error("خطأ :", err);
    throw new Error("خطأ أثناء جلب المنتجات");
  }
}






export async function addProduct({
  productName,
  code,
  category,
  warehouse,
  payPrice,
  sellPrice,
  unit,
  quantity,
}) {
  try {
    const response = await apiClient.post("/api/products", {
      name: productName,
      code,
      category,
      warehouse,
      payPrice,
      sellPrice,
      unit,
      quantity,
    });
    return response.data;
  } catch (err) {
    console.error("خطأ في تسجيل الدخول:", err);
    throw new Error("خطأ أثناء إضافة منتج جديد");
  }
}

export async function getProductById(id: string) {
  try {
    const response = await apiClient.post("/api/products/byId", { id });
    return response.data;
  } catch (err) {
    console.error("❌ خطأ في جلب المنتج:", err);
    throw new Error("خطأ أثناء جلب المنتج بواسطة المعرف");
  }
}

export const updateProduct = async (id: string, newData: any) => {
  const res = await apiClient.put(`/api/products/${id}`, newData);
  return res.data;
};

export const deleteProduct = async (id: string) => {
  const res = await apiClient.delete(`/api/products/${id}`);
  return res.data;
};
