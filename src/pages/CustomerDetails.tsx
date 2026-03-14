import CustomerPaymentForm from "@/components/Customers/CustomerPaymentForm";
import DetailsInputs from "@/components/Customers/DetailsInputs";
import { DataTable } from "@/components/dashboard/DataTable";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import CustomerPDF, { Operations } from "@/components/pdf/CustomerPDF";
import PdfDocument from "@/components/pdf/PdfDocument";
import PaymentTypeSelector from "@/components/sellProduct/PaymentTypeSelector";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import FormInput from "@/components/ui/custom/FormInput";
import PopupForm from "@/components/ui/custom/PopupForm";
import {
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getCustomerById } from "@/services/customer";
import { handleCustomerReturn, payCustomerDebt } from "@/services/transaction";
import { parseDate } from "@/utils/parseDate";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import Skeleton from "@mui/material/Skeleton";
import { Select } from "@radix-ui/react-select";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, FileText } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function CustomerDetails() {
  const navigate = useNavigate();
  const location = useLocation();
  const customerId = location.state;
  const [isOpenTo, setIsOpenTo] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [amount, setAmount] = useState(0);
  const [note, setNote] = useState("");
  const queryClient = useQueryClient();
  const [openReturnId, setOpenReturnId] = useState(null);
  const [returnAmounts, setReturnAmounts] = useState<{
    [productId: string]: string;
  }>({});
  const [isDebt, setIsDebt] = useState<"cash" | "part" | "debt">("cash");
  const [partValue, setPartValue] = useState(0);
  const [reason, setReason] = useState("");
  const [currency, setCurrency] = useState("");
  const [exchangeRate, setExchangeRate] = useState(1);

  const payCustomerDebtMutation = useMutation({
    mutationFn: (dataToSend: any) => payCustomerDebt(dataToSend as any),
    onSuccess: () => {
      toast.success("تم إضافة الدفعة بنجاح!");
      setAmount(0);
      setNote("");
      setCurrency("");
      setExchangeRate(1);
      setIsOpen(false);
      setIsOpenTo(false);
      queryClient.invalidateQueries({ queryKey: ["customer-details"] });
    },
    onError: (error) => {
      console.error(error);
      toast.error("حدث خطأ أثناء إضافة الدفعة");
    },
  });

  const returnMutation = useMutation({
    mutationFn: (dataToSend: {
      productCode: string;
      customerId: string;
      warehouse: string;
      qty: number;
      returnValue: number;
      referenceId: string;
      returnType: "cash" | "debt" | "part";
      partValue: number;
      productId: string;
      reason: string;
    }) => handleCustomerReturn(dataToSend),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customer-details"] });
    },
    onError: (error) => {
      console.error(error);
      toast.error("حدث خطأ أثناء الإرجاع");
    },
  });

  const [customer, setCustomer] = useState<any>({});

  const { data, isLoading } = useQuery({
    queryKey: ["customer-details", customerId],
    queryFn: () => getCustomerById(customerId),
    enabled: !!customerId,
  });

  useEffect(() => {
    if (data?.data) {
      setCustomer(data.data);
    }
  }, [data]);

  const paymentsColumns = [
    { label: "المعرف", key: "id", hidden: true },
    { label: "المبلغ", key: "amount" },
    { label: "الوصف", key: "note" },
    { label: "التاريخ", key: "date" },
  ];

  const purchasesColumns = [
    { label: "المعرف", key: "id", hidden: true },
    { label: "السعر النهائي", key: "totalPrice" },
    { label: "المنتجات", key: "productsString" },
    { label: "التاريخ", key: "date" },
  ];

  const operations: Operations[] = [
    ...(data?.data?.purchases
      ?.filter((p) => Array.isArray(p.products) && p.products.length > 0)
      .map((p) => ({
        details: p?.products.map((prod) => prod.name).join(", "),
        date: p?.date,
        toTheCustoemr: p?.totalPrice ?? 0,
        fromCustomer: 0,
      })) ?? []),
    ...(data?.data?.payments ?? []).map((p) => ({
      details: p?.note,
      date: p?.date,
      toTheCustoemr: 0,
      fromCustomer: p?.amount,
    })),
  ];

  operations.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  return (
    <DashboardLayout>
      <div className="space-y-6" dir="rtl">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">بيانات الزبون</h1>
          <Button onClick={() => navigate(-1)} variant="outline">
            <ArrowLeft className="ml-2 w-4 h-4" /> رجوع
          </Button>
        </div>

        {/* معلومات أساسية */}
        <Card>
          <CardHeader>
            <CardTitle>المعلومات الأساسية</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4">
            <DetailsInputs customer={customer} setCustomer={setCustomer} />

            <div className="grid grid-cols-3 gap-4">
              <Button>
                <PDFDownloadLink
                  document={
                    <PdfDocument>
                      <CustomerPDF
                        customerName={customer.name}
                        balance={0}
                        operations={operations}
                      />
                    </PdfDocument>
                  }
                  fileName={`فاتورة_${customer.name}_.pdf`}
                >
                  {({ loading }) =>
                    loading ? (
                      "جاري إنشاء الفاتورة..."
                    ) : (
                      <div className="flex items-center justify-center">
                        <FileText className="w-4 h-4 ml-2" />
                        تصدير الفاتورة PDF
                      </div>
                    )
                  }
                </PDFDownloadLink>
              </Button>
              <CustomerPaymentForm
                isOpen={isOpen}
                setIsOpen={setIsOpen}
                customerData={customerId}
              />
              {/* إضافة دفعة */}
              <PopupForm
                title="دفع للزبون"
                trigger={
                  <Button
                    onClick={(e) => {
                      setIsOpenTo(true);
                      e.stopPropagation();
                    }}
                    variant="destructive"
                    size="sm"
                    className="w-full"
                  >
                    دفع للزبون
                  </Button>
                }
                isOpen={isOpenTo}
                setIsOpen={setIsOpenTo}
              >
                <form
                  className="space-y-4 mt-4"
                  onSubmit={(e) => {
                    e.preventDefault();
                    payCustomerDebtMutation.mutate({
                      customerId: customerId.id,
                      amount:
                        currency == "USD"
                          ? -amount
                          : -Number((amount / exchangeRate).toFixed(1)),
                      note,
                      currency: currency,
                      exchangeRate: exchangeRate,
                      amount_base: -amount,
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
                        onChange={(e) =>
                          setExchangeRate(Number(e.target.value))
                        }
                        disabled={currency === "USD"}
                      />
                    </>
                  )}

                  <Button className="w-full" type="submit">
                    اضافة دفعة
                  </Button>
                </form>
              </PopupForm>
            </div>
          </CardContent>
        </Card>

        {/* الدفعات و المشتريات */}
        <Card className="overflow-x-auto">
          {isLoading ? (
            <Skeleton className="h-48 w-full" />
          ) : !data?.data ? (
            <p className="text-muted-foreground text-center">
              لا توجد معاملات حالياً.
            </p>
          ) : (
            <CardContent className="space-y-4 md:space-y-0 grid grid-cols-1 gap-4">
              <DataTable
                title="الدفعات"
                columns={paymentsColumns}
                data={[...(data?.data.payments ?? [])].sort(
                  (a, b) => parseDate(b.date) - parseDate(a.date),
                )}
              />
              <DataTable
                title="عمليات الشراء"
                columns={purchasesColumns}
                data={
                  data
                    ? data.data.purchases
                        .filter(
                          (purchase) =>
                            Array.isArray(purchase.products) &&
                            purchase.products.length > 0,
                        )
                        .map((purchase) => ({
                          ...purchase,
                          productsString: purchase.products
                            .map((p) => p.name)
                            .join(", "),
                        }))
                        .sort((a, b) => parseDate(b.date) - parseDate(a.date))
                    : []
                }
                renderRowActions={(row) => (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        navigate(`/sellDetails`, { state: row.id });
                      }}
                    >
                      تفاصيل
                    </Button>
                    <PopupForm
                      title={`إرجاع منتجات الفاتورة`}
                      isOpen={openReturnId === row.id}
                      setIsOpen={() => setOpenReturnId(null)}
                      trigger={
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenReturnId(row.id);
                          }}
                        >
                          إرجاع
                        </Button>
                      }
                    >
                      <form
                        className="space-y-4"
                        onSubmit={(e) => {
                          e.preventDefault();
                          const productsToReturn = row.products
                            .filter(
                              (p) => (Number(returnAmounts[p.id]) || 0) > 0,
                            )
                            .map((p) => ({
                              productId: p.id,
                              productCode: p.code,
                              customerId: row.customerId,
                              warehouse: p.warehouse,
                              qty: -Number(returnAmounts[p.id]),
                              returnValue:
                                Number(returnAmounts[p.id]) * p.sellPrice,
                              referenceId: row.id,
                              partValue: partValue,
                              returnType: isDebt,
                              reason: reason,
                            }));

                          productsToReturn.forEach((prod) => {
                            console.log(prod);
                            returnMutation.mutate(prod);
                          });
                          toast.success("تم تسجيل الإرجاع بنجاح!");
                          setOpenReturnId(null);
                          setReturnAmounts({});
                        }}
                      >
                        <div className="max-h-96 overflow-y-auto mt-4 border-2 rounded-md ">
                          {row.products.map((product) => (
                            <div
                              key={product.id}
                              className="border p-2 rounded-md"
                            >
                              <p className="font-semibold">{product.name}</p>
                              <p>الكمية الأصلية: {product.qty}</p>
                              <p>سعر الوحدة: {product.sellPrice}</p>
                              <p>المستودع: {product.warehouse}</p>
                              <FormInput
                                id={`return-${product.id}`}
                                label="كمية الإرجاع"
                                value={(
                                  returnAmounts[product.id] || 0
                                ).toString()}
                                onChange={(e) => {
                                  let qty = e.target.value;

                                  // التأكد من عدم تجاوز الحد الأعلى والأدنى
                                  if (qty > product.qty) qty = product.qty;

                                  setReturnAmounts((prev) => ({
                                    ...prev,
                                    [product.id]: qty,
                                  }));
                                }}
                              />
                              <p>
                                المبلغ:{" "}
                                {(Number(returnAmounts[product.id]) || 0) *
                                  product.sellPrice}
                              </p>
                            </div>
                          ))}
                        </div>
                        <p className="font-bold">
                          المجموع الكلي:{" "}
                          {row.products.reduce(
                            (sum, p) =>
                              sum +
                              (Number(returnAmounts[p.id]) || 0) * p.sellPrice,
                            0,
                          )}
                        </p>

                        <PaymentTypeSelector
                          value={isDebt}
                          onChange={setIsDebt}
                          partValue={partValue}
                          onPartValueChange={(v) => setPartValue(v)}
                        />

                        <FormInput
                          id={`return-reason`}
                          label="ملاحظات"
                          type="text"
                          value={reason}
                          onChange={(e) => {
                            setReason(e.target.value);
                          }}
                        />
                        <Button type="submit" className="w-full">
                          تأكيد الإرجاع
                        </Button>
                      </form>
                    </PopupForm>
                  </div>
                )}
              />
            </CardContent>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}
