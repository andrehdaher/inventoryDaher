import React, { useState } from "react";
import PopupForm from "../ui/custom/PopupForm";
import { Button } from "../ui/button";
import FormInput from "../ui/custom/FormInput";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { payCustomerDebt } from "@/services/transaction";
import { toast } from "sonner";

export default function CustomerPaymentForm({ isOpen, setIsOpen, customerData }) {
  const [isDebt, setIsDebt] = useState<"cash" | "part" | "debt">("cash");
  const [partValue, setPartValue] = useState(0);
  const [amount, setAmount] = useState(0);
  const [note, setNote] = useState("");
  const [currency, setCurrency] = useState("");
  const [exchangeRate, setExchangeRate] = useState(1);

  const queryClient = useQueryClient();

  const payCustomerDebtMutation = useMutation({
    mutationFn: (dataToSend: any) => payCustomerDebt(dataToSend as any),
    onSuccess: () => {
      toast.success("تم إضافة الدفعة بنجاح!");
      setAmount(0);
      setNote("");
      setCurrency("");
      setExchangeRate(1);
      setIsOpen(false);
      queryClient.invalidateQueries({ queryKey: ["customer-details"] });
    },
    onError: (error) => {
      console.error(error);
      toast.error("حدث خطأ أثناء إضافة الدفعة");
    },
  });

  return (
    <PopupForm
      title="اضافة دفعة"
      trigger={
        <Button
          onClick={(e) => {
            setIsOpen(true);
            e.stopPropagation();
          }}
          variant="accent"
          size="sm"
          className="w-full"
        >
          اضافة دفعة من الزبون
        </Button>
      }
      isOpen={isOpen}
      setIsOpen={setIsOpen}
    >
      <form
        className="space-y-4 mt-4"
        onSubmit={(e) => {
          e.preventDefault();
          payCustomerDebtMutation.mutate({
            customerId: customerData.id,
            amount:
              currency == "USD"
                ? amount
                : Number((amount / exchangeRate).toFixed(1)),
            note,
            currency: currency,
            exchangeRate: exchangeRate,
            amount_base: amount,
          });
        }}
      >
        <FormInput
          label="قيمة الدفعة"
          id="payment-amount"
          type="number"
          value={amount.toString()}
          onChange={(e) => setAmount(Number(e.target.value))}
        />
        <FormInput
          label="ملاحظات"
          id="note"
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />

        {!(isDebt == "debt") && (
          <>
            {" "}
            <Select value={currency} onValueChange={setCurrency}>
              <SelectTrigger className="w-full mt-6">
                <SelectValue placeholder="العملة المدفوع بها" />
              </SelectTrigger>
              <SelectContent>
                {["SYP", "USD"].map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormInput
              id="exchangeRate"
              label="سعر الصرف"
              value={currency == "USD" ? 1 : exchangeRate}
              onChange={(e) => setExchangeRate(Number(e.target.value))}
              disabled={currency === "USD"}
            />
          </>
        )}

        <Button className="w-full" type="submit">
          اضافة دفعة
        </Button>
      </form>
    </PopupForm>
  );
}
