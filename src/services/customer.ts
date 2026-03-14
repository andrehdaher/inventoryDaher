import { Customer } from "@/components/Customers/DetailsInputs";
import apiClient from "@/lib/axios";

export default async function getAllCustomer() {

    try {
        const response = await apiClient.get("/api/customers");
        return response.data
      
    } catch (err) {
      console.error("خطأ :", err);
      throw new Error("خطأ أثناء جلب العملاء");
   
    }

}
export async function addCustomer({
  name,
  number,

}) {
  try {
    const response = await apiClient.post("/api/customers",{
      name,
      number
    });
    return response.data
    
  } catch (err) {
    console.error("خطأ في تسجيل الدخول:", err);
    throw new Error("خطأ أثناء إضافة عميل جديد");
  }
}

export async function getCustomerById({ id }: { id: string }) {
  try {
    const response = await apiClient.post("/api/customers/byId", { id });
    return response.data;
  } catch (err) {
    console.error("خطأ في جلب المورد:", err);
    throw new Error("خطأ أثناء جلب العميل بواسطة المعرف");
  }
}


export async function updateCustomer(id: string, data: Partial<Customer>) {
  try {
    const response = await apiClient.put(`/api/customers/${id}`, {name: data.name, number: data.number});
    return response.data;
  } catch (err) {
    console.error("خطأ في تحديث العميل:", err);
    throw new Error("خطأ أثناء تحديث بيانات العميل");
  }
}

