import { DataTable } from "@/components/dashboard/DataTable";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import getAllPayments from "@/services/payments";
import { useQuery } from "@tanstack/react-query";
import {
  TrendingUp,
  Wallet,
  ArrowDownCircle,
  CalendarIcon,
} from "lucide-react";
import { useMemo, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Payment } from "@/services/payments";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { format } from "date-fns";
import { DateRange } from "react-day-picker";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import AddBalanceForm from "@/components/FinancialStatement/AddBalanceForm";
import TakeBalanceForm from "@/components/FinancialStatement/TakeBalanceForm";
import Loading from "@/components/ui/custom/Loading";

export default function FinancialStatement() {
  const [isOpenPay, setIsOpenPay] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const { data: payments, isLoading } = useQuery<Payment[]>({
    queryKey: ["payments-table"],
    queryFn: () => getAllPayments(),
  });

  // ---------------- فلاتر ----------------
  const [selectedType, setSelectedType] = useState<string>("all");

  // تصفية البيانات حسب الفلاتر
  const filteredPayments = useMemo(() => {
    let data = payments || [];

    if (selectedType !== "all") {
      data = data.filter((p) => p.type === selectedType);
    }

    if (dateRange?.from && dateRange?.to) {
      data = data.filter((p) => {
        if (!p.date) return false;
        const paymentDate = new Date(p.date);
        return paymentDate >= dateRange.from && paymentDate <= dateRange.to;
      });
    }

    return data;
  }, [payments, selectedType, dateRange]);

  // ---------------- الأعمدة ----------------
  const paymentsColumns = [
    { label: "المعرف", key: "id", hidden: true },
    { label: "النوع", key: "type", sortable: true },
    { label: "المبلغ", key: "amount", sortable: true },
    { label: "الوصف", key: "note", sortable: true },
    {
      label: "التاريخ",
      key: "date",
      sortable: true,
    },
  ];

  // ---------------- إحصائيات ----------------
  const returns = useMemo(() => {
    return (
      filteredPayments
        ?.filter((c) => c.type === "return")
        .reduce((sum, c) => sum + Number(c.amount), 0) || 0
    );
  }, [filteredPayments]);

const todaystotals = useMemo(() => {
  const today = new Date().toISOString().split("T")[0];

  return payments
    ?.filter((c) => {
      if (!c.date) return false;

      const date = new Date(c.date);

      if (isNaN(date.getTime())) return false;

      return date.toISOString().split("T")[0] === today;
    })
    .reduce<Record<string, number>>((acc, curr) => {
      const currency = curr.currency.toUpperCase();

      const value = currency === "USD" ? curr.amount : curr.amount_base;

      acc[currency] = (acc[currency] || 0) + value;

      return acc;
    }, {});
}, [payments]);
  const totals = useMemo(() => {
    return payments?.reduce<Record<string, number>>((acc, curr) => {
      const currency = curr.currency.toUpperCase();

      const value = currency === "USD" ? Number(curr.amount) : Number(curr.amount_base);

      acc[currency] = (acc[currency] || 0) + value;

      return acc;
    }, {});
  }, [payments]);

  return (
    <DashboardLayout>
      <div dir="rtl" className="space-y-6">
        {/* البطاقات الإحصائية */}
        { isLoading ? <Loading /> :
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {todaystotals &&
              Object.entries(todaystotals).map(([currency, total]) => (
                <StatsCard
                  title="صندوق اليوم"
                  value={total.toLocaleString("en-US") || 0}
                  icon={Wallet}
                  description={currency}
                />
              ))}

            {totals &&
              Object.entries(totals).map(([currency, total]) => (
                <div>
                  <StatsCard
                    title="الرصيد الحالي"
                    value={total.toLocaleString("en-US") || 0}
                    icon={TrendingUp}
                    description={currency}
                    onlyAdmin={true}
                  />
                </div>
              ))}
            <StatsCard
              title="إجمالي المرتجع"
              value={returns.toLocaleString("en-US")}
              icon={ArrowDownCircle}
            />
          </div>
        }

        <Card>
          <CardHeader className="flex flex-col">
            <div>
              <h1 className="font-bold text-2xl mb-4">الحركة المالية</h1>
              <div className="flex gap-2">
                <AddBalanceForm isOpen={isOpen} setIsOpen={setIsOpen} />
                <TakeBalanceForm isOpen={isOpenPay} setIsOpen={setIsOpenPay} />
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              {/* الفلاتر */}
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="نوع العملية" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">الكل</SelectItem>
                  <SelectItem value="income">إيراد</SelectItem>
                  <SelectItem value="expense">مصروف</SelectItem>
                </SelectContent>
              </Select>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-[260px] justify-start text-left font-normal"
                  >
                    <CalendarIcon className="ml-2 h-4 w-4" />
                    {dateRange?.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "yyyy-MM-dd")} -{" "}
                          {format(dateRange.to, "yyyy-MM-dd")}
                        </>
                      ) : (
                        format(dateRange.from, "yyyy-MM-dd")
                      )
                    ) : (
                      <span>اختر المدة</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    selected={dateRange}
                    onSelect={setDateRange}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Loading />
            ) : (
              <DataTable
                title=""
                columns={paymentsColumns}
                data={filteredPayments ? [...filteredPayments].reverse() : []}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
