import React from "react";
import PopupForm from "../ui/custom/PopupForm";
import { Button } from "../ui/button";
import FormInput from "../ui/custom/FormInput";
import { addCustomer } from "@/services/customer";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export default function CustomerSelect({ isOpen, setIsOpen, className }) {
  const [customerName, setCustomerName] = React.useState("");
  const [customerNumber, setCustomerNumber] = React.useState("");
  const queryClient = useQueryClient();

  const addCustomerMutation = useMutation({
    mutationFn: (newCustomer: any) =>
      addCustomer({ ...newCustomer, balance: 0 }),
    onSuccess: () => {
      setCustomerName("");
      setCustomerNumber("");

      setIsOpen(false);

      queryClient.invalidateQueries({
        queryKey: ["customers-table"],
      });
    },
    onError: (error) => {
      console.error(error);
      toast.error("حدث خطأ أثناء إضافة الزبون");
    },
  });

  return (
    <PopupForm
      title="اضافة الزبون"
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      trigger={
        <Button
          type="button"
          variant="default"
          className={`w-full ${className}`}
        >
          اضافة زبون
        </Button>
      }
    >
      <form
        action=""
        className="space-y-4"
        onSubmit={() => {
          if (!customerName || !customerNumber) {
            toast.error("يرجى ملء جميع الحقول");
            return;
          } else {
            addCustomerMutation.mutate({
              name: customerName,
              number: customerNumber,
            });
          }
        }}
      >
        <FormInput
          id="customer-name"
          label="اسم الزبون"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
        />
        <FormInput
          type="number"
          id="customer-number"
          label="رقم الزبون"
          value={customerNumber}
          onChange={(e) => setCustomerNumber(e.target.value)}
        />

        <Button
          type="submit"
          className="w-full"
          disabled={addCustomerMutation.isPending}
        >
          {addCustomerMutation.isPending ? "جاري الإضافة..." : "اضافة"}
        </Button>
      </form>
    </PopupForm>
  );
}
