import { ProductTableRow } from "@/pages/Products";
import FormInput from "../ui/custom/FormInput";
import PopupForm from "../ui/custom/PopupForm";
import { Button } from "../ui/button";
import PaymentTypeSelector from "../sellProduct/PaymentTypeSelector";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { handleWarehouseTransfare } from "@/services/transaction";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import WarehouseSelect from "../Warehouses/WarehouseSelect";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface TransferFormProps {
  row: ProductTableRow;
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

/* ---------------------------------- */
/* ✅ Schema Validation */
/* ---------------------------------- */
const transferSchema = z.object({
  warehouse: z.string().min(1, "اختر المستودع المنقول إليه"),
  quantity: z.coerce.number().positive("الكمية يجب أن تكون أكبر من صفر"),
  sellPrice: z.coerce.number().positive("سعر المبيع غير صحيح"),
  amount: z.coerce.number().min(0, "تكلفة النقل غير صحيحة"),
  currency: z.enum(["USD", "SYP"]),
  note: z.string().optional(),
});

type TransferFormValues = z.infer<typeof transferSchema>;

export default function TransferForm({
  row,
  isOpen,
  setIsOpen,
}: TransferFormProps) {
  const queryClient = useQueryClient();

  const [isDebt, setIsDebt] = useState<"cash" | "debt" | "part">("cash");
  const [partValue, setPartValue] = useState(0);

  /* ---------------------------------- */
  /* ✅ React Hook Form */
  /* ---------------------------------- */
  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<TransferFormValues>({
    resolver: zodResolver(transferSchema),
    defaultValues: {
      warehouse: "",
      quantity: 0,
      sellPrice: row.sellPrice,
      amount: 0,
      currency: "USD",
      note: "",
    },
  });

  /* ---------------------------------- */
  /* ✅ Reset when row changes */
  /* ---------------------------------- */
  useEffect(() => {
    if (!row) return;

    reset({
      warehouse: "",
      quantity: 0,
      sellPrice: row.sellPrice,
      amount: 0,
      currency: "USD",
      note: "",
    });
  }, [row, reset]);

  /* ---------------------------------- */
  /* ✅ Mutation */
  /* ---------------------------------- */
  const warehouseTransfare = useMutation({
    mutationFn: (transferData: {
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
    }) => handleWarehouseTransfare(transferData),

    onSuccess: () => {
      setIsOpen(false);

      queryClient.invalidateQueries({ queryKey: ["products-table"] });
      queryClient.invalidateQueries({ queryKey: ["warehouses-table"] });
    },

    onError: (error) => {
      console.error(error);
      toast.error("حدث خطأ أثناء نقل المنتج");
    },
  });

  /* ---------------------------------- */
  /* ✅ Submit */
  /* ---------------------------------- */
  const onSubmit = (values: TransferFormValues) => {
    if (values.quantity > row.quantity) {
      toast.error("الكمية المدخلة أكبر من الكمية المتوفرة");
      return;
    }

    if (isDebt === "part" && partValue <= 0) {
      toast.error("الرجاء إدخال قيمة الدفعة الجزئية");
      return;
    }

    if (isDebt === "part" && partValue >= values.amount) {
      toast.error("قيمة الدفعة الجزئية يجب أن تكون أقل من المبلغ الكلي");
      return;
    }

    warehouseTransfare.mutate({
      productId: row.id,
      oldWarehouse: row.warehouse,
      newWarehouse: values.warehouse,
      exchangeRate: 0,
      amount_base: values.amount,
      amount: values.amount,
      currency: values.currency,
      quantity: values.quantity,
      note: values.note,
      newSellPrice: values.sellPrice,
    });
  };

  /* ---------------------------------- */
  /* ✅ Max Quantity */
  /* ---------------------------------- */
  const handleSetMaxQuantity = () => {
    setValue("quantity", row.quantity);
  };

  return (
    <PopupForm
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      trigger={<></>}
      title="نقل منتج"
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[75vh] overflow-y-auto overflow-x-hidden">
          {/* معلومات ثابتة */}
          <FormInput label="اسم المنتج" disabled value={row.name} />
          <FormInput label="صنف المنتج" disabled value={row.category} />
          <FormInput label="الواحدة" disabled value={row.unit} />
          <FormInput label="المستودع القديم" disabled value={row.warehouse} />

          {/* المستودع الجديد */}
          <Controller
            name="warehouse"
            control={control}
            render={({ field }) => (
              <WarehouseSelect value={field.value} onChange={field.onChange} />
            )}
          />
          {errors.warehouse && (
            <p className="text-red-500 text-sm">{errors.warehouse.message}</p>
          )}

          {/* الكمية */}
          <div className="flex">
            <Controller
              name="quantity"
              control={control}
              render={({ field }) => (
                <FormInput
                  type="number"
                  label="الكمية المراد نقلها"
                  value={field.value}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                  className="rounded-l-none"
                />
              )}
            />

            <Button
              type="button"
              className="mt-6 rounded-r-none"
              onClick={handleSetMaxQuantity}
            >
              {row.quantity}
            </Button>
          </div>
          {errors.quantity && (
            <p className="text-red-500 text-sm">{errors.quantity.message}</p>
          )}

          {/* سعر البيع */}
          <Controller
            name="sellPrice"
            control={control}
            render={({ field }) => (
              <FormInput
                type="number"
                label="سعر المبيع"
                value={field.value}
                onChange={(e) => field.onChange(Number(e.target.value))}
              />
            )}
          />
          {errors.sellPrice && (
            <p className="text-red-500 text-sm">{errors.sellPrice.message}</p>
          )}

          {/* تكلفة النقل + العملة */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 md:col-span-1">
            <div className="sm:col-span-2">
              <Controller
                name="amount"
                control={control}
                render={({ field }) => (
                  <FormInput
                    label="تكلفة النقل"
                    value={field.value}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    className="rounded-l-none"
                  />
                )}
              />
            </div>

            <Controller
              name="currency"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="mt-6 rounded-r-none">
                    <SelectValue placeholder="العملة" />
                  </SelectTrigger>
                  <SelectContent>
                    {["SYP", "USD"].map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          {/* نوع الدفع */}
          <div className="md:col-span-2">
            <PaymentTypeSelector
              value={isDebt}
              onChange={setIsDebt}
              partValue={partValue}
              onPartValueChange={setPartValue}
            />
          </div>

          {/* الملاحظات */}
          <div className="md:col-span-2">
            <Controller
              name="note"
              control={control}
              render={({ field }) => (
                <FormInput
                  label="ملاحظات النقل"
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />
          </div>

          {/* زر الإرسال */}
          <Button
            type="submit"
            className="w-full md:col-span-2"
            disabled={warehouseTransfare.isPending}
          >
            {warehouseTransfare.isPending ? "جاري النقل..." : "تأكيد"}
          </Button>
        </div>
      </form>
    </PopupForm>
  );
}
