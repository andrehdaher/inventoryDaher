// schemas/addProduct.schema.ts
import { z } from "zod";

export const addProductSchema = z.object({
  name: z.string().min(1, "اسم المنتج مطلوب"),
  code: z.string().min(1, "رمز المنتج مطلوب"),
  category: z.string().min(1, "الصنف مطلوب"),
  warehouse: z.string().min(1, "المستودع مطلوب"),
  payPrice: z.coerce.number().positive(),
  sellPrice: z.coerce.number().positive(),
  quantity: z.coerce.number().positive(),
  unit: z.string().min(1),
  supplierId: z.string().min(1, "المورد مطلوب"),

  isDebt: z.enum(["cash", "part", "debt"]),
  partValue: z.coerce.number().optional(),
  currency: z.enum(["USD", "SYP"]).optional(),
  exchangeRate: z.coerce.number().default(1),
});
