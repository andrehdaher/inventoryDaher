// schemas/addProduct.schema.ts
import { z } from "zod";

export const addWarehouseSchema = z.object({
  name: z.string().min(1, "اسم المستودع مطلوب"),
  location: z.string().min(1, "الموقع مطلوب"),
});
