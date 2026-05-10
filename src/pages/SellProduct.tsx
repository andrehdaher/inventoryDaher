import AccountSelect from "@/components/Accounts/AccountSelect";
import AddCustomerForm from "@/components/Customers/AddCustomerForm";
import { DataTable } from "@/components/dashboard/DataTable";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import ProductsTable from "@/components/sellProduct/ProductsTable";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import FormInput from "@/components/ui/custom/FormInput";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import getAllCustomer from "@/services/customer";
import getAllProducts from "@/services/products";
import { sell, sellProducts } from "@/services/transaction";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

export default function SellProduct() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [selectedProducts, setSelectedProducts] = useState<any[]>([]);
  const [discount, setDiscount] = useState("");
  const [amount, setAmount] = useState("");
  const [finalAmount, setFinalAmount] = useState(0);
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const [isDebt, setIsDebt] = useState<"cash" | "part" | "debt">("cash");
  const [partValue, setPartValue] = useState("");
  const [currency, setCurrency] = useState("");
  const [exchangeRate, setExchangeRate] = useState(1);
  const [paymentAccountId, setPaymentAccountId] = useState("");
  const [receivableAccountId, setReceivableAccountId] = useState("");
  const [salesAccountId, setSalesAccountId] = useState("");

  const queryClient = useQueryClient();

  const sellProductMutation = useMutation({
    mutationFn: (dataToSend: sell) => sellProducts({ newSell: dataToSend }),
    onSuccess: () => {
      toast.success("تم بيع المنتج بنجاح!");
      setSelectedProducts([]);
      setDiscount("");
      setAmount("");
      setFinalAmount(0);
      setSelectedRows([]);
      setIsDebt("cash");
      setPartValue("");
      setCurrency("");
      setExchangeRate(1);
      setPaymentAccountId("");
      setReceivableAccountId("");
      setSalesAccountId("");
      queryClient.invalidateQueries({
        queryKey: ["sells-table"],
      });
    },
    onError: (error) => {
      console.error(error);
      toast.error("حدث خطأ أثناء بيع المنتج");
    },
  });

  const isRowSelected = (row: any) => {
    return selectedRows.some((r) => JSON.stringify(r) === JSON.stringify(row));
  };

  const toggleRowSelection = (row: any) => {
    setSelectedRows((prev) => {
      const isSelected = isRowSelected(row);
      if (isSelected) {
        return prev.filter((r) => JSON.stringify(r) !== JSON.stringify(row));
      }
      return [row];
    });
  };

  const { data: products } = useQuery({
    queryKey: ["products-table"],
    queryFn: getAllProducts,
  });

  useEffect(() => {
    setFinalAmount(Number((Number(amount) - Number(discount)).toFixed(3)));
  }, [discount, amount]);

  const { data: customers } = useQuery({
    queryKey: ["customers-table"],
    queryFn: getAllCustomer,
  });

  const customerColumns = [
    { key: "id", label: "الرمز", sortable: true, hidden: true },
    { key: "name", label: "الاسم", sortable: true },
    { key: "number", label: "الرقم", sortable: true },
  ];

  const validateAccounts = () => {
    if (!salesAccountId) {
      toast.error("الرجاء اختيار حساب المبيعات");
      return false;
    }

    if ((isDebt === "cash" || isDebt === "part") && !paymentAccountId) {
      toast.error("الرجاء اختيار حساب القبض");
      return false;
    }

    if ((isDebt === "debt" || isDebt === "part") && !receivableAccountId) {
      toast.error("الرجاء اختيار حساب العملاء");
      return false;
    }

    return true;
  };

  return (
    <DashboardLayout>
      <Card>
        <CardHeader>
          <h1 className="text-2xl font-bold">بيع المنتجات</h1>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <div className="md:col-span-1">
            <DataTable
              title="الزبائن"
              titleButton={
                <AddCustomerForm
                  isOpen={isOpen}
                  setIsOpen={setIsOpen}
                  className="w-full mb-2"
                />
              }
              columns={customerColumns || []}
              data={customers || []}
              onRowClick={(row) => toggleRowSelection(row)}
              getRowClassName={(row) =>
                selectedRows?.some((r) => r === row)
                  ? "bg-green-50 hover:bg-green-100"
                  : ""
              }
            />
          </div>

          <div className="md:col-span-2">
            <ProductsTable
              products={products}
              setAmount={setAmount}
              onChange={(selected) => setSelectedProducts(selected)}
            />
          </div>

          <form className="md:col-span-3 mt-8 grid grid-cols-1 md:grid-cols-2 gap-3">
            <FormInput
              label="الحسم"
              id="discount-amount"
              type="text"
              value={discount}
              onChange={(e) => setDiscount(e.target.value)}
            />

            <FormInput
              label="السعر النهائي"
              id="final-amount"
              type="text"
              value={finalAmount.toString()}
              onChange={() => {}}
            />

            <div className="grid grid-cols-3 gap-2 md:col-span-2">
              <Button
                onClick={() => setIsDebt("cash")}
                className="col-span-1"
                variant={isDebt === "cash" ? "default" : "outline"}
                type="button"
              >
                نقدا
              </Button>
              <Button
                onClick={() => setIsDebt("part")}
                className="col-span-1"
                variant={isDebt === "part" ? "default" : "outline"}
                type="button"
              >
                جزئي
              </Button>
              <Button
                onClick={() => setIsDebt("debt")}
                className="col-span-1"
                variant={isDebt === "debt" ? "default" : "outline"}
                type="button"
              >
                دين
              </Button>
            </div>

            {isDebt === "part" && (
              <FormInput
                id="partPayment"
                label="قيمة الدفعة"
                value={partValue.toString()}
                onChange={(e) => setPartValue(e.target.value)}
              />
            )}

            {isDebt !== "debt" && (
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
                  value={currency === "USD" ? 1 : exchangeRate}
                  onChange={(e) => setExchangeRate(Number(e.target.value))}
                  disabled={currency === "USD"}
                />
              </>
            )}

            <AccountSelect
              label="حساب المبيعات"
              value={salesAccountId}
              onChange={setSalesAccountId}
              filterType="sales"
            />

            {(isDebt === "cash" || isDebt === "part") && (
              <AccountSelect
                label="حساب القبض"
                value={paymentAccountId}
                onChange={setPaymentAccountId}
                filterType="payment"
              />
            )}

            {(isDebt === "debt" || isDebt === "part") && (
              <AccountSelect
                label="حساب العملاء"
                value={receivableAccountId}
                onChange={setReceivableAccountId}
                filterType="receivable"
              />
            )}

            <Button
              className="w-full md:col-span-2"
              variant="accent"
              disabled={sellProductMutation.isPending}
              loading={sellProductMutation.isPending}
              onClick={(e) => {
                e.preventDefault();

                if (selectedRows.length <= 0) {
                  toast.error("الرجاء التأكد من اختيار زبون");
                  return;
                }

                if (!selectedProducts.length) {
                  toast.error("الرجاء اختيار منتج واحد على الأقل");
                  return;
                }

                if (!validateAccounts()) {
                  return;
                }

                const paidAmount =
                  isDebt === "cash"
                    ? finalAmount
                    : isDebt === "part"
                      ? currency === "USD"
                        ? Number(partValue)
                        : Number((Number(partValue) / exchangeRate).toFixed(1))
                      : 0;

                sellProductMutation.mutate({
                  customerId: selectedRows[0].id,
                  totalPrice: finalAmount,
                  products: selectedProducts,
                  paymentStatus:
                    isDebt === "cash"
                      ? "cash"
                      : isDebt === "part"
                        ? "part"
                        : "debt",
                  remainingDebt:
                    isDebt === "cash" ? 0 : finalAmount - paidAmount,
                  paymentAccountId:
                    isDebt === "debt" ? undefined : paymentAccountId,
                  receivableAccountId:
                    isDebt === "cash" ? undefined : receivableAccountId,
                  salesAccountId,
                  currency,
                  exchangeRate,
                  amount_base: finalAmount * exchangeRate,
                  partValue: Number(partValue || 0),
                });
              }}
            >
              اتمام عملية البيع
            </Button>
          </form>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
