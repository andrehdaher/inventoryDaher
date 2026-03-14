import apiClient from "@/lib/axios";

export interface sell {
  id?: string; // معرّف الفاتورة
  customerId: string; // معرف الزبون (يمكن يكون null لو بيع مباشر بدون زبون)
  totalPrice: number; // المجموع الكلي للفاتورة
  paymentStatus: "cash" | "part" | "debt"; // حالة الدفع
  remainingDebt: number; // المبلغ المتبقي على الزبون
  products: {
    productId: string; // معرف المنتج
    code: string; // كود المنتج
    name: string; // اسم المنتج
    warehouse: string; // المستودع
    quantity: number; // الكمية المباعة
    sellPrice: number; // سعر الوحدة عند البيع
    unit?: string; // وحدة القياس (اختياري)
    totalPrice: number; // السعر الإجمالي (quantity * sellPrice)
  }[];
  date?: string; // تاريخ العملية
  currency: string;
  exchangeRate: number;
  amount_base: number;
  partValue: number;
}

export interface returnData {
  productCode: string;
  supplierId?: string;
  customerId?: string;
  warehouse: string;
  qty: number;
  returnValue: number;
  referenceId: string;
  productId: string;
  reason: string;
}

export interface Product {
  id: string;
  name: string;
  code: string;
  category: string;
  payPrice: number;
  sellPrice: number;
  unit: string;
  quantity: number;
  warehouse: string;
  updatedDate: string;
}

export interface purchase {
  id: string;
  supplierId: string;
  name?: string;
  code: string;
  warehouse: string;
  quantity: number;
  payPrice: number;
  totalPrice: number;
  paymentStatus: string;
  currency: string;
  exchangeRate: number;
  amount_base: number;
  remainingDebt: number;
  date: string;
}

export async function payNewProduct({
  newPurchase,
  newProduct,
}: {
  newPurchase: purchase;
  newProduct: Product;
}) {
  try {
    const response = await apiClient.post("/api/transactions/purchase", {
      newPurchase,
      newProduct,
    });
    return response.data;
  } catch (err) {
    console.error("خطأ في تسجيل الدخول:", err);

    if (err.response && err.response.data?.message) {
      throw new Error(err.response.data.message);
    }

    throw new Error("فشل الاتصال بالسيرفر");
  }
}

export async function sellProducts({ newSell }: { newSell: sell }) {
  try {
    const response = await apiClient.post("/api/transactions/sell", {
      newSell,
    });
    return response.data;
  } catch (err) {
    console.error("خطأ في تسجيل الدخول:", err);

    if (err.response && err.response.data?.message) {
      throw new Error(err.response.data.message);
    }

    throw new Error("فشل الاتصال بالسيرفر");
  }
}

export async function endExchange({
  exchangeData,
  realRate,
  amount_final,
  id,
}: {
  exchangeData: any;
  realRate: number;
  amount_final: number;
  id: string;
}) {
  try {
    const response = await apiClient.post("/api/transactions/endExchange", {
      exchangeData,
      realRate,
      amount_final,
      id,
    });
    return response.data;
  } catch (err) {
    console.error("خطأ في تسجيل الدخول:", err);

    if (err.response && err.response.data?.message) {
      throw new Error(err.response.data.message);
    }

    throw new Error("فشل الاتصال بالسيرفر");
  }
}

export async function payCustomerDebt(dataToSend: {
  customerId: string;
  amount: number;
  note: string;
  currency: string;
  exchangeRate: number;
  amount_base: number;
}) {
  try {
    const response = await apiClient.post("/api/transactions/customerPayment", {
      paymentData: {
        customerId: dataToSend.customerId,
        amount: Number(dataToSend.amount),
        note: dataToSend.note,
        currency: dataToSend.currency,
        exchangeRate: dataToSend.exchangeRate,
        amount_base: dataToSend.amount_base,
        type: "income",
      },
    });
    return response.data;
  } catch (err) {
    console.error("خطأ :", err);

    if (err.response && err.response.data?.message) {
      throw new Error(err.response.data.message);
    }

    throw new Error("فشل الاتصال بالسيرفر");
  }
}

export async function paySupplierDebt(dataToSend: {
  supplierId: string;
  amount: number;
  note: string;
  currency: string;
  exchangeRate: number;
  amount_base: number;
}) {
  try {
    const response = await apiClient.post("/api/transactions/supplierPayment", {
      paymentData: {
        supplierId: dataToSend.supplierId,
        amount: dataToSend.amount,
        note: dataToSend.note,
        currency: dataToSend.currency,
        exchangeRate: dataToSend.exchangeRate,
        amount_base: dataToSend.amount_base,
        type: "expense",
      },
    });
    return response.data;
  } catch (err) {
    console.error("خطأ :", err);

    if (err.response && err.response.data?.message) {
      throw new Error(err.response.data.message);
    }

    throw new Error("فشل الاتصال بالسيرفر");
  }
}

export async function handleCustomerReturn(newReturn: {
  productCode: string;
  customerId: string;
  warehouse: string;
  qty: number;
  returnValue: number;
  referenceId: string;
  returnType: "debt" | "cash" | "part";
  partValue: number;
  productId: string;
  reason: string;
}) {
  try {
    const response = await apiClient.post("/api/transactions/CustomerReturn", {
      newReturn: {
        productCode: newReturn.productCode,
        customerId: newReturn.customerId,
        warehouse: newReturn.warehouse,
        qty: newReturn.qty,
        returnValue: newReturn.returnValue,
        referenceId: newReturn.referenceId,
        productId: newReturn.productId,
        returnType: newReturn.returnType,
        partValue: newReturn.partValue,
        reason: newReturn.reason,
      },
    });
    return response.data;
  } catch (err) {
    console.error("خطأ :", err);

    if (err.response && err.response.data?.message) {
      throw new Error(err.response.data.message);
    }

    throw new Error("فشل الاتصال بالسيرفر");
  }
}

export async function handleSupplierReturn(newReturn: {
  productCode: string;
  supplierId: string;
  warehouse: string;
  qty: number;
  returnValue: number;
  referenceId: string;
  returnType: "debt" | "cash" | "part";
  partValue: number;
  productId: string;
  reason: string;
}) {
  try {
    const response = await apiClient.post("/api/transactions/SupplierReturn", {
      newReturn: {
        productCode: newReturn.productCode,
        supplierId: newReturn.supplierId,
        warehouse: newReturn.warehouse,
        qty: newReturn.qty,
        returnValue: newReturn.returnValue,
        referenceId: newReturn.productId,
        productId: newReturn.productId,
        returnType: newReturn.returnType,
        partValue: newReturn.partValue,
        reason: newReturn.reason,
      },
    });
    return response.data;
  } catch (err) {
    console.error("خطأ :", err);

    if (err.response && err.response.data?.message) {
      throw new Error(err.response.data.message);
    }

    throw new Error("فشل الاتصال بالسيرفر");
  }
}

export async function handleWarehouseTransfare(transferData: {
  productId: string;
  oldWarehouse: string;
  newWarehouse: string;
  exchangeRate: number;
  amount_base: number;
  amount: number;
  currency: string;
  quantity: number;
  note: string;
  newSellPrice?: number;
}) {
  try {
    const response = await apiClient.post(
      "/api/transactions/warehouseTransfer",
      {
        transferData,
      },
    );
    return response.data;
  } catch (err) {
    console.error("خطأ :", err);

    if (err.response && err.response.data?.message) {
      throw new Error(err.response.data.message);
    }

    throw new Error("فشل الاتصال بالسيرفر");
  }
}

export async function handleAfterSellDiscount({ discount, sellId, customerId }: { discount: number; sellId: string; customerId: string }) {
  try {
    const response = await apiClient.post(
      "/api/transactions/afterSellDiscount",
      {
        discount,
        sellId,
        customerId,
      },
    );
    return response.data;
  } catch (err) {
    console.error("خطأ :", err);

    if (err.response && err.response.data?.message) {
      throw new Error(err.response.data.message);
    }

    throw new Error("فشل الاتصال بالسيرفر");
  }
}
