import AccountSelect from "@/components/Accounts/AccountSelect";
import DetailsInputs from "@/components/Customers/DetailsInputs";
import { DataTable } from "@/components/dashboard/DataTable";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import PaymentTypeSelector from "@/components/sellProduct/PaymentTypeSelector";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import FormInput from "@/components/ui/custom/FormInput";
import PopupForm from "@/components/ui/custom/PopupForm";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getSupplierById } from "@/services/supplier";
import {
  handleSupplierReturn,
  paySupplierDebt,
} from "@/services/transaction";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import Skeleton from "@mui/material/Skeleton";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function SupplierDetails() {
  const navigate = useNavigate();
  const location = useLocation();
  const supplierId = location.state;

  const [isOpen, setIsOpen] = useState(false);
  const [isOpenTo, setIsOpenTo] = useState(false);
  const [returnAmount, setReturnAmount] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [isDebt, setIsDebt] = useState<"cash" | "part" | "debt">("cash");
  const [partValue, setPartValue] = useState(0);
  const [reason, setReason] = useState("");
  const [currency, setCurrency] = useState("");
  const [exchangeRate, setExchangeRate] = useState(1);
  const [openRowId, setOpenRowId] = useState<string | null>(null);
  const [paymentAccountId, setPaymentAccountId] = useState("");
  const [payableAccountId, setPayableAccountId] = useState("");
  const [inventoryAccountId, setInventoryAccountId] = useState("");

  const queryClient = useQueryClient();
  const [supplier, setSupplier] = useState<any>({});

  const { data, isLoading } = useQuery({
    queryKey: ["supplier-details", supplierId],
    queryFn: () => getSupplierById(supplierId),
    enabled: !!supplierId,
  });

  useEffect(() => {
    if (data?.data) {
      setSupplier(data.data);
      setPaymentAccountId(data.data.defaultPaymentAccountId || "");
      setPayableAccountId(data.data.defaultPayableAccountId || "");
      setInventoryAccountId(data.data.defaultInventoryAccountId || "");
    }
  }, [data]);

  const resetPaymentForm = () => {
    setAmount("");
    setNote("");
    setCurrency("");
    setExchangeRate(1);
  };

  const validateSupplierPaymentAccounts = () => {
    if (!paymentAccountId || !payableAccountId) {
      toast.error("الرجاء اختيار حساب الدفع وحساب الموردين");
      return false;
    }
    return true;
  };

  const validateSupplierReturnAccounts = () => {
    if (!inventoryAccountId) {
      toast.error("الرجاء اختيار حساب المخزون");
      return false;
    }

    if ((isDebt === "cash" || isDebt === "part") && !paymentAccountId) {
      toast.error("الرجاء اختيار حساب الدفع");
      return false;
    }

    if ((isDebt === "debt" || isDebt === "part") && !payableAccountId) {
      toast.error("الرجاء اختيار حساب الموردين");
      return false;
    }

    return true;
  };

  const paySupplierDebtMutation = useMutation({
    mutationFn: (dataToSend: any) => paySupplierDebt(dataToSend as any),
    onSuccess: () => {
      toast.success("تم إضافة الدفعة بنجاح!");
      resetPaymentForm();
      setIsOpen(false);
      setIsOpenTo(false);
      queryClient.invalidateQueries({
        queryKey: ["supplier-details"],
      });
    },
    onError: (error) => {
      console.error(error);
      toast.error("حدث خطأ أثناء إضافة الدفعة");
    },
  });

  const returnMutation = useMutation({
    mutationFn: (dataToSend: {
      productCode: string;
      productName?: string;
      supplierName?: string;
      supplierId: string;
      warehouse: string;
      qty: number;
      returnValue: number;
      referenceId: string;
      productId: string;
      returnType: "debt" | "cash" | "part";
      partValue: number;
      reason: string;
      inventoryAccountId?: string;
      payableAccountId?: string;
      paymentAccountId?: string;
    }) => handleSupplierReturn(dataToSend),
    onSuccess: () => {
      toast.success("تم الارجاع بنجاح!");
      setReturnAmount("");
      setReason("");
      setPartValue(0);
      setOpenRowId(null);
      queryClient.invalidateQueries({
        queryKey: ["supplier-details"],
      });
    },
    onError: (error) => {
      console.error(error);
      toast.error("حدث خطأ أثناء ارجاع المنتج");
    },
  });

  const paymentsColumns = [
    { label: "المعرف", key: "id", hidden: true },
    { label: "المبلغ", key: "amount" },
    { label: "الوصف", key: "note" },
    { label: "التاريخ", key: "date" },
  ];

  const purchasesColumns = [
    { label: "المعرف", key: "id", hidden: true },
    { label: "كود المادة", key: "code" },
    { label: "اسم المادة", key: "name" },
    { label: "الكمية", key: "quantity" },
    { label: "المستودع", key: "warehouse" },
    { label: "السعر النهائي", key: "totalPrice" },
    { label: "التاريخ", key: "date" },
  ];

  const handleReturn = async (e: React.FormEvent, row: any) => {
    e.preventDefault();

    if (!validateSupplierReturnAccounts()) {
      return;
    }

    try {
      const payload = {
        productCode: row.code,
        productName: row.name,
        supplierName: supplier.name,
        supplierId: supplierId.id,
        warehouse: row.warehouse,
        qty: -Number(returnAmount),
        returnType: isDebt,
        returnValue: Number(returnAmount) * row.payPrice,
        referenceId: row.id,
        productId: row.id,
        partValue,
        reason,
        inventoryAccountId,
        payableAccountId,
        paymentAccountId,
      };

      returnMutation.mutate(payload);
    } catch (error: any) {
      console.error("خطأ أثناء الإرجاع:", error.response?.data || error.message);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6" dir="rtl">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">بيانات المورد</h1>
          <Button onClick={() => navigate(-1)} variant="outline">
            <ArrowLeft className="ml-2 w-4 h-4" /> رجوع
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>المعلومات الأساسية</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4">
            <DetailsInputs
              customer={supplier}
              setCustomer={setSupplier}
              isSupplier={true}
            />

            <div className="grid grid-cols-2 gap-4">
              <PopupForm
                title="دفعة من المورد"
                trigger={
                  <Button
                    className="w-full"
                    onClick={(e) => {
                      setIsOpen(true);
                      e.stopPropagation();
                    }}
                    variant="accent"
                    size="sm"
                  >
                    دفعة من المورد
                  </Button>
                }
                isOpen={isOpen}
                setIsOpen={setIsOpen}
              >
                <form
                  className="space-y-4 mt-4"
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!validateSupplierPaymentAccounts()) return;

                    paySupplierDebtMutation.mutate({
                      supplierId: supplierId.id,
                      amount:
                        currency === "USD"
                          ? amount
                          : Number((Number(amount) / exchangeRate).toFixed(1)),
                      note,
                      currency,
                      exchangeRate,
                      amount_base: amount,
                      paymentAccountId,
                      payableAccountId,
                    });
                  }}
                >
                  <FormInput
                    label="قيمة الدفعة"
                    id="payment-amount-in"
                    type="text"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                  <FormInput
                    label="ملاحظات"
                    id="note-in"
                    type="text"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                  />
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
                    id="exchangeRate-in"
                    label="سعر الصرف"
                    value={currency === "USD" ? 1 : exchangeRate}
                    onChange={(e) => setExchangeRate(Number(e.target.value))}
                    disabled={currency === "USD"}
                  />
                  <AccountSelect
                    label="حساب الدفع"
                    value={paymentAccountId}
                    onChange={setPaymentAccountId}
                    filterType="payment"
                  />
                  <AccountSelect
                    label="حساب الموردين"
                    value={payableAccountId}
                    onChange={setPayableAccountId}
                    filterType="payable"
                  />
                  <Button
                    className="w-full"
                    type="submit"
                    disabled={paySupplierDebtMutation.isPending}
                    loading={paySupplierDebtMutation.isPending}
                  >
                    دفعة من المورد
                  </Button>
                </form>
              </PopupForm>

              <PopupForm
                title="دفع للمورد"
                trigger={
                  <Button className="w-full" variant="destructive" size="sm">
                    دفع للمورد
                  </Button>
                }
                isOpen={isOpenTo}
                setIsOpen={setIsOpenTo}
              >
                <form
                  className="space-y-4 mt-4"
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!validateSupplierPaymentAccounts()) return;

                    paySupplierDebtMutation.mutate({
                      supplierId: supplierId.id,
                      amount:
                        currency === "USD"
                          ? -Number(amount)
                          : -Number((Number(amount) / exchangeRate).toFixed(1)),
                      note,
                      currency,
                      exchangeRate,
                      amount_base: -Number(amount),
                      paymentAccountId,
                      payableAccountId,
                    });
                  }}
                >
                  <FormInput
                    label="قيمة الدفعة"
                    id="payment-amount-out"
                    type="text"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                  <FormInput
                    label="ملاحظات"
                    id="note-out"
                    type="text"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                  />
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
                    id="exchangeRate-out"
                    label="سعر الصرف"
                    value={currency === "USD" ? 1 : exchangeRate}
                    onChange={(e) => setExchangeRate(Number(e.target.value))}
                    disabled={currency === "USD"}
                  />
                  <AccountSelect
                    label="حساب الدفع"
                    value={paymentAccountId}
                    onChange={setPaymentAccountId}
                    filterType="payment"
                  />
                  <AccountSelect
                    label="حساب الموردين"
                    value={payableAccountId}
                    onChange={setPayableAccountId}
                    filterType="payable"
                  />
                  <Button
                    className="w-full"
                    type="submit"
                    disabled={paySupplierDebtMutation.isPending}
                    loading={paySupplierDebtMutation.isPending}
                  >
                    دفع للمورد
                  </Button>
                </form>
              </PopupForm>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-x-auto">
          {isLoading ? (
            <Skeleton className="h-48 w-full" />
          ) : !data?.data?.payments?.length && !data?.data?.purchases?.length ? (
            <p className="text-muted-foreground text-center">
              لا توجد معاملات حاليا.
            </p>
          ) : (
            <CardContent className="space-y-4 md:space-y-0 grid grid-cols-1 md:grid-cols-2 gap-4">
              <DataTable
                title="الدفعات"
                columns={paymentsColumns}
                data={[...(data?.data?.payments || [])].sort(
                  (a, b) =>
                    new Date(b.date).getTime() - new Date(a.date).getTime(),
                )}
              />
              <DataTable
                title="عمليات الشراء"
                columns={purchasesColumns}
                data={data.data.purchases}
                renderRowActions={(row) => (
                  <PopupForm
                    title={`إرجاع منتج: ${row.code} - ${row.name || ""}`}
                    isOpen={openRowId === row.id.toString()}
                    setIsOpen={() => setOpenRowId(null)}
                    trigger={
                      <Button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setOpenRowId(row.id.toString());
                        }}
                      >
                        إرجاع
                      </Button>
                    }
                  >
                    <form
                      onSubmit={(e) => handleReturn(e, row)}
                      className="space-y-4"
                    >
                      <div>
                        <FormInput
                          label="الكمية"
                          id="return-quantity"
                          type="number"
                          value={returnAmount}
                          onChange={(e) => setReturnAmount(e.target.value)}
                        />
                        <p className="text-sm text-gray-500">
                          الكمية الأصلية: {row.quantity}
                          <br />
                          سعر الواحدة: {row.payPrice}
                        </p>
                      </div>

                      <p className="font-semibold">
                        المبلغ الإجمالي: {row.payPrice * Number(returnAmount)}
                      </p>

                      <PaymentTypeSelector
                        value={isDebt}
                        onChange={setIsDebt}
                        partValue={partValue}
                        onPartValueChange={(v) => setPartValue(v)}
                      />

                      <FormInput
                        id="return-reason"
                        label="ملاحظات"
                        type="text"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                      />

                      <AccountSelect
                        label="حساب المخزون"
                        value={inventoryAccountId}
                        onChange={setInventoryAccountId}
                        filterType="inventory"
                      />
                      {(isDebt === "debt" || isDebt === "part") && (
                        <AccountSelect
                          label="حساب الموردين"
                          value={payableAccountId}
                          onChange={setPayableAccountId}
                          filterType="payable"
                        />
                      )}
                      {(isDebt === "cash" || isDebt === "part") && (
                        <AccountSelect
                          label="حساب الدفع"
                          value={paymentAccountId}
                          onChange={setPaymentAccountId}
                          filterType="payment"
                        />
                      )}

                      <div className="flex justify-end mt-2">
                        <Button
                          type="submit"
                          className="w-full"
                          disabled={returnMutation.isPending}
                          loading={returnMutation.isPending}
                        >
                          تأكيد الإرجاع
                        </Button>
                      </div>
                    </form>
                  </PopupForm>
                )}
              />
            </CardContent>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}
