import { Button } from "../ui/button";
import PopupForm from "../ui/custom/PopupForm";
import { addWarehouseSchema } from "@/schemas/addWarehouse.schema";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createNewWarehouse } from "@/services/warehouse";
import FormInput from "../ui/custom/FormInput";

type AddWarehouseProps = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
};

type FormValues = z.infer<typeof addWarehouseSchema>;

const AddWarehouse = ({ isOpen, setIsOpen }: AddWarehouseProps) => {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(addWarehouseSchema),
    defaultValues: {
      name: "",
      location: "",
    },
  });

  const addWarehouseMutation = useMutation({
    mutationFn: (data: FormValues) =>
      createNewWarehouse(data.name, data.location),
    onSuccess: () => {
      reset();
      setIsOpen(false);
      queryClient.invalidateQueries({ queryKey: ["warehouses-table"] });
    },
  });

  const onSubmit = (data: FormValues) => {
    addWarehouseMutation.mutate(data);
  };

  return (
    <PopupForm
      title="إضافة مستودع جديد"
      trigger={
        <></>
      }
      isOpen={isOpen}
      setIsOpen={setIsOpen}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Name */}
        <FormInput
          label="اسم المستودع"
          placeholder="مثال: المستودع الرئيسي"
          error={errors.name?.message}
          {...register("name")}
        />

        {/* Location */}
        <FormInput
          label="الموقع"
          placeholder="دمشق - المزة"
          error={errors.location?.message}
          {...register("location")}
        />

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-2">
          <Button className="w-full" type="submit" disabled={addWarehouseMutation.isPending}>
            {addWarehouseMutation.isPending ? "جاري الحفظ..." : "حفظ"}
          </Button>
        </div>
      </form>
    </PopupForm>
  );
};

export default AddWarehouse;
