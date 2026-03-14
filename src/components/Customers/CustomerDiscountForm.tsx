import PopupForm from "../ui/custom/PopupForm";
import { Button } from "../ui/button";
import { MinusCircle } from "lucide-react";
import FormInput from "../ui/custom/FormInput";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { handleAfterSellDiscount } from "@/services/transaction";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { DiscountFormValues, discountSchema } from "@/schemas/customerDiscount.schema";
import { toast } from "sonner";

type CustomerDiscountFormProp = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  customerId: string;
  sellId: string
};

const CustomerDiscountForm = ({
  isOpen,
  setIsOpen,
  customerId,
  sellId,
}: CustomerDiscountFormProp) => {
  const queryClient = useQueryClient();

  /* =========================
     🔹 REACT HOOK FORM
  ========================= */
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<DiscountFormValues>({
    resolver: zodResolver(discountSchema),
    defaultValues: {
      discountValue: 0,
    },
  });

  const discountValue = watch("discountValue");

  /* =========================
     🔹 MUTATION
  ========================= */
  const confirmMutation = useMutation({
    mutationFn: (data: DiscountFormValues) =>
      handleAfterSellDiscount({
        customerId,
        discount: data.discountValue,
        sellId: sellId,
      }),

    onSuccess: () => {
      toast.success("تم إضافة الحسم بنجاح");

      queryClient.invalidateQueries({
        queryKey: ["customer-details", customerId],
      });

      reset();
      setIsOpen(false);
    },

    onError: (error) => {
      console.error(error);
      toast.error("حدث خطأ أثناء إضافة الحسم");
    },
  });

  const onSubmit = (data: DiscountFormValues) => {
    confirmMutation.mutate(data);
  };

  return (
    <PopupForm
      trigger={
        <Button className="w-full" variant="accent">
          <MinusCircle className="w-4 h-4" />
          إضافة حسم
        </Button>
      }
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      title="إضافة حسم للعميل"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <p className="text-muted-foreground text-sm">
          سيتم إضافة حسم بقيمة{" "}
          <span className="font-semibold">{discountValue || 0}</span> للعميل. لا
          يمكن التراجع عن الحسم بعد تأكيده.
        </p>

        <div>
          <FormInput
            label="قيمة الحسم"
            type="number"
            step={0.01}
            placeholder="أدخل قيمة الحسم"
            {...register("discountValue", { valueAsNumber: true })}
          />

          {errors.discountValue && (
            <p className="text-destructive text-sm mt-1">
              {errors.discountValue.message}
            </p>
          )}
        </div>

        <div className="flex gap-4">
          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting || confirmMutation.isPending}
            loading={confirmMutation.isPending}
          >
            {confirmMutation.isPending ? "جاري التنفيذ..." : "تأكيد"}
          </Button>

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => {
              reset();
              setIsOpen(false);
            }}
          >
            إلغاء
          </Button>
        </div>
      </form>
    </PopupForm>
  );
};

export default CustomerDiscountForm;
