import React, { useState } from "react";
import PopupForm from "../ui/custom/PopupForm";
import { Button } from "../ui/button";
import { useMutation } from "@tanstack/react-query";
import { createPayment, Payment } from "@/services/payments";
import FormInput from "../ui/custom/FormInput";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { toast } from "sonner";

export default function AddBalanceForm({isOpen, setIsOpen, className}: {isOpen: boolean; setIsOpen: React.Dispatch<React.SetStateAction<boolean>>; className?: string}) {
    
    const [amount, setAmount] = useState<number>(0);
    const [note, setNote] = useState<string>("");
    const [currency, setCurrency] = useState<string>("USD");
    const [exchangeRate, setExchangeRate] = useState<number>(1);

    const createPaymentMutate = useMutation({
        mutationFn: (dataToSend: Payment) =>
          createPayment({ newPayment: dataToSend }),
        onSuccess: () => {
          toast.success("تم اضافة الدفعة!");
          setIsOpen(false);
        },
        onError: (error) => {
          console.error(error);
          toast.error("حدث خطأ اثناء الاضافة");
        },
    });

    return (
      <div>
        <PopupForm
          title="اضافة دفعة للصندوق"
          trigger={
            <Button
              className={`${className}`}
              onClick={(e) => {
                setIsOpen(true);
                e.stopPropagation();
              }}
              variant="accent"
            >
              قبض
            </Button>
          }
          isOpen={isOpen}
          setIsOpen={setIsOpen}
        >
          <form
            className="space-y-4 mt-4"
            onSubmit={(e) => {
              e.preventDefault();
              
              if (amount <= 0) {
                toast.error("الرجاء ادخال قيمة صحيحة للدفعة");
                return;
              }

              if (currency !== "USD" && exchangeRate <= 0) {
                toast.error("الرجاء ادخال سعر صرف صحيح");
                return;
              }

              if (note.trim() === "") {
                toast.error("الرجاء ادخال ملاحظة للدفعة");
                return;
              }

              createPaymentMutate.mutate({
                supplierId: "elidaher",
                amount:
                  currency == "USD"
                    ? amount
                    : Number((amount / exchangeRate).toFixed(1)),
                note,
                currency: currency,
                exchangeRate: exchangeRate,
                amount_base: amount,
                type: "income",
              });
            }}
          >
            <FormInput
              label="قيمة الدفعة"
              id="payment-amount"
              type="text"
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

            {
              <>
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
            }

            <Button className="w-full" type="submit">
              اتمام العملية
            </Button>
          </form>
        </PopupForm>
      </div>
    );
}
