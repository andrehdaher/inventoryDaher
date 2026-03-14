import React, { useEffect } from "react";
import PopupForm from "../ui/custom/PopupForm";
import { Button } from "../ui/button";
import FormInput from "../ui/custom/FormInput";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { payNewProduct } from "@/services/transaction";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { addProductSchema } from "@/schemas/addProduct.schema";
import { object, z } from "zod";
import SupplierSelect from "./SupplierSelect";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import WarehouseSelect from "../Warehouses/WarehouseSelect";
import { toast } from "sonner";
import { queryKeys } from "@/lib/queryKeys";
import { useProductsGrouping } from "@/hooks/useProductsGrouping";

type FormValues = z.infer<typeof addProductSchema>;

export default function AddProductForm({
  isOpen,
  setIsOpen,
  row, // ✅ موجودة
}: {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  row?: any;
}) {
  const { groupByCategory } = useProductsGrouping();
  const groupedProducts = groupByCategory();
  const categoriesName = Object.keys(groupedProducts).map(c => {
    return {
      id: c,
      name: c
    }
  });
  console.log(categoriesName);

  const queryClient = useQueryClient();
  const [openSupplier, setOpenSupplier] = React.useState(false);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    control,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(addProductSchema),
    defaultValues: {
      isDebt: "cash",
      currency: "USD",
      exchangeRate: 1,
    },
  });

  const isDebt = watch("isDebt");
  const currency = watch("currency");

  // ✅ تعبئة الفورم من row
  useEffect(() => {
    if (!row) return;

    reset({
      name: row.name,
      code: row.code,
      category: row.category,
      warehouse: row.warehouse,
      payPrice: row.payPrice,
      sellPrice: row.sellPrice,
      unit: row.unit,
      quantity: row.quantity ?? 1,
      supplierId: row.supplierId ?? "",
      isDebt: "cash",
      currency: "USD",
      exchangeRate: 1,
    });
  }, [row, reset]);

  // ✅ Mutation
  const mutation = useMutation({
    mutationFn: (data: { newProduct: any; newPurchase: any }) =>
      payNewProduct(data),
    onSuccess: () => {
      reset();
      setIsOpen(false);
      queryClient.invalidateQueries({
        queryKey: queryKeys.products,
      });
    },
  });

  // ✅ نفس منطقك التجاري السابق بالكامل
  const onSubmit = (values: FormValues) => {
    const total = values.quantity * values.payPrice;


    if (values.isDebt !== "debt" && !values.currency) {
      toast.error("الرجاء اختيار العملة");
      return;
    }

    if (values.isDebt === "part" && (values.partValue ?? 0) <= 0) {
      toast.error("الرجاء إدخال قيمة الدفعة الجزئية");
      return;
    }

    if (
      values.isDebt !== "debt" &&
      values.currency === "SYP" &&
      values.exchangeRate <= 0
    ) {
      toast.error("الرجاء إدخال سعر صرف صحيح");
      return;
    }

    if (values.isDebt === "part" && (values.partValue ?? 0) >= total) {
      toast.error("قيمة الدفعة الجزئية لا يمكن أن تكون أكبر أو تساوي المبلغ الكلي");
      return;
    }

    const remainingDebt =
      values.isDebt === "debt"
        ? total
        : values.isDebt === "cash"
          ? 0
          : total -
            (values.currency === "USD"
              ? values.partValue!
              : Number((values.partValue! / values.exchangeRate).toFixed(1)));

    mutation.mutate({
      newProduct: {
        name: values.name,
        code: values.code,
        category: values.category,
        warehouse: values.warehouse,
        payPrice: values.payPrice,
        sellPrice: values.sellPrice,
        unit: values.unit,
        quantity: values.quantity,
      },
      newPurchase: {
        supplierId: values.supplierId,
        name: values.name,
        code: values.code,
        warehouse: values.warehouse,
        quantity: values.quantity,
        payPrice: values.payPrice,
        currency: values.currency!,
        exchangeRate: values.exchangeRate,
        amount_base: values.payPrice * values.exchangeRate,
        totalPrice: total,
        paymentStatus: "pending",
        remainingDebt,
      },
    });
    queryClient.invalidateQueries({ queryKey: ["products-table"] });
  };

  return (
    <PopupForm
      trigger={<></>}
      title={row ? "تعديل المنتج" : "شراء منتجات"}
      isOpen={isOpen}
      setIsOpen={setIsOpen}
    >
      <form
        dir="rtl"
        onSubmit={handleSubmit(onSubmit)}
        className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[75vh] overflow-y-auto overflow-x-hidden"
      >
        <FormInput
          label="اسم المنتج"
          {...register("name")}
          error={errors.name?.message}
        />
        <FormInput
          label="رمز المنتج"
          {...register("code")}
          error={errors.code?.message}
        />
        
        <Controller
          control={control}
          name="category"
          render={({ field }) => (
            <FormInput label="الصنف" {...field} options={categoriesName} />
          )}
        />

        <Controller
          control={control}
          name="warehouse"
          render={({ field }) => (
            <WarehouseSelect
              label="المستودع"
              value={field.value}
              onChange={field.onChange}
            />
          )}
        />

        <FormInput label="سعر الشراء" type="number" {...register("payPrice")} />
        <FormInput
          label="سعر المبيع"
          type="number"
          {...register("sellPrice")}
        />
        <FormInput label="الكمية" type="number" {...register("quantity")} />
        <FormInput label="الواحدة" {...register("unit")} />

        {/* نوع الدفع */}
        <div className="md:col-span-2 grid grid-cols-3 gap-2">
          {(["cash", "part", "debt"] as const).map((v) => (
            <Button
              key={v}
              type="button"
              variant={isDebt === v ? "default" : "outline"}
              onClick={() => setValue("isDebt", v)}
            >
              {v === "cash" ? "نقداً" : v === "part" ? "جزئي" : "دين"}
            </Button>
          ))}
        </div>

        {isDebt === "part" && (
          <FormInput
            label="قيمة الدفعة"
            type="number"
            {...register("partValue")}
          />
        )}

        {isDebt !== "debt" && (
          <>
            <Controller
              control={control}
              name="currency"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="mt-6">
                    <SelectValue placeholder="العملة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="SYP">SYP</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />

            <FormInput
              label="سعر الصرف"
              type="number"
              disabled={currency === "USD"}
              {...register("exchangeRate")}
            />
          </>
        )}

        <Controller
          control={control}
          name="supplierId"
          render={({ field }) => (
            <SupplierSelect
              className="mt-6"
              isOpen={openSupplier}
              setIsOpen={setOpenSupplier}
              supplierId={field.value}
              setSupplierId={field.onChange}
              withDataTable
            />
          )}
        />

        <Button
          className="md:col-span-2"
          type="submit"
          disabled={mutation.isPending}
        >
          {mutation.isPending ? "جارٍ الحفظ..." : row ? "تعديل" : "إضافة"}
        </Button>
      </form>
    </PopupForm>
  );
}
