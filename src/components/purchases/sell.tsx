// import { useMemo } from "react";
// import { useQuery } from "@tanstack/react-query";
// import {
//   AlertCircle,
//   PackageMinus,
//   RefreshCw,
//   ShoppingCart,
//   UserRound,
// } from "lucide-react";
// import { useSells, Sell } from "@/hooks/useSell";
// import getAllCustomer from "@/services/customer";
// import { DataTable } from "../dashboard/DataTable";
// import { StatsCard } from "../dashboard/StatsCard";
// import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
// import { Button } from "../ui/button";

// export interface SellTableRow {
//   id: string;
//   productName: string;
//   productCode: string;
//   quantity: number;
//   customerName: string;
//   invoiceNumber: string;
//   totalPrice: number;
//   amountBase: number;
//   currency: string;
//   paymentStatus: string;
//   remainingDebt: number;
//   warehouse: string;
//   profit: number;
//   date: string;
// }

// const emptyValue = "غير محدد";

// const toNumber = (value: unknown) => {
//   const numericValue = Number(value);
//   return Number.isFinite(numericValue) ? numericValue : 0;
// };

// const getSellDate = (item: Sell) => item.date || item.createdAt || "";

// const normalizeDateText = (value: string) =>
//   value
//     .replace(/[\u200e\u200f\u061c]/g, "")
//     .replace("،", ",")
//     .replace("ص", "AM")
//     .replace("م", "PM")
//     .trim();

// const parseSellDate = (value: string) => {
//   if (!value) return 0;

//   const nativeDate = Date.parse(value);
//   if (!Number.isNaN(nativeDate)) return nativeDate;

//   const normalized = normalizeDateText(value);
//   const match = normalized.match(
//     /^(\d{1,2})\/(\d{1,2})\/(\d{4}),?\s+(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)?$/i,
//   );

//   if (!match) return 0;

//   const [, day, month, year, hour, minute, second = "0", period] = match;
//   let parsedHour = Number(hour);

//   if (period?.toUpperCase() === "PM" && parsedHour < 12) parsedHour += 12;
//   if (period?.toUpperCase() === "AM" && parsedHour === 12) parsedHour = 0;

//   return new Date(
//     Number(year),
//     Number(month) - 1,
//     Number(day),
//     parsedHour,
//     Number(minute),
//     Number(second),
//   ).getTime();
// };

// const isToday = (value: string) => {
//   const time = parseSellDate(value);
//   if (!time) return false;

//   const date = new Date(time);
//   const today = new Date();

//   return (
//     date.getFullYear() === today.getFullYear() &&
//     date.getMonth() === today.getMonth() &&
//     date.getDate() === today.getDate()
//   );
// };

// export default function SellComponent() {
//   const {
//     data: sells = [],
//     isLoading,
//     isError,
//     error,
//     refetch,
//     isFetching,
//   } = useSells();

//   const { data: customers = [] } = useQuery({
//     queryKey: ["customers-table"],
//     queryFn: getAllCustomer,
//     staleTime: 1000 * 60 * 5,
//     refetchOnWindowFocus: false,
//   });

//   const customersMap = useMemo(() => {
//     if (!Array.isArray(customers)) return {};

//     return Object.fromEntries(
//       customers.map((customer: any) => [String(customer.id), customer.name]),
//     );
//   }, [customers]);

//   const tableData: SellTableRow[] = useMemo(
//     () =>
//       sells.map((item) => {
//         const products = Array.isArray(item.products) ? item.products : [];
//         const customerName =
//           item.customerName ||
//           item.customer?.name ||
//           customersMap[String(item.customerId || "")];
//         const quantity = products.length
//           ? products.reduce(
//               (sum, product) =>
//                 sum + (toNumber(product.qty) || toNumber(product.quantity)),
//               0,
//             )
//           : toNumber(item.quantity) || toNumber(item.qty);
//         const totalCost = products.reduce(
//           (sum, product) =>
//             sum +
//             (toNumber(product.qty) || toNumber(product.quantity)) *
//               toNumber(product.payPrice),
//           0,
//         );
//         const totalPrice = toNumber(item.totalPrice);

//         return {
//           id: item.id?.toString() || "",
//           productName:
//             products.map((product) => product.name).filter(Boolean).join(", ") ||
//             item.productName ||
//             item.product?.name ||
//             emptyValue,
//           productCode:
//             products.map((product) => product.code).filter(Boolean).join(", ") ||
//             item.product?.code ||
//             item.productCode ||
//             emptyValue,
//           quantity,
//           customerName: customerName || emptyValue,
//           invoiceNumber:
//             item.invoiceNumber ||
//             item.sellId?.toString() ||
//             item.id?.toString().slice(0, 8) ||
//             emptyValue,
//           totalPrice,
//           amountBase: toNumber(item.amount_base),
//           currency: item.currency || emptyValue,
//           paymentStatus: item.paymentStatus || emptyValue,
//           remainingDebt: toNumber(item.remainingDebt),
//           warehouse:
//             Array.from(
//               new Set(products.map((product) => product.warehouse).filter(Boolean)),
//             ).join(", ") || emptyValue,
//           profit: totalPrice - totalCost,
//           date: getSellDate(item),
//         };
//       }),
//     [customersMap, sells],
//   );

//   const summary = useMemo(() => {
//     const totalQuantity = tableData.reduce(
//       (sum, item) => sum + item.quantity,
//       0,
//     );
//     const totalValue = tableData.reduce((sum, item) => sum + item.totalPrice, 0);
//     const totalBaseValue = tableData.reduce(
//       (sum, item) => sum + item.amountBase,
//       0,
//     );
//     const totalProfit = tableData.reduce((sum, item) => sum + item.profit, 0);
//     const todaySells = tableData.filter((item) => isToday(item.date)).length;
//     const customersCount = new Set(
//       tableData
//         .map((item) => item.customerName)
//         .filter((name) => name && name !== emptyValue),
//     ).size;

//     return {
//       totalSells: tableData.length,
//       totalQuantity,
//       totalValue,
//       totalBaseValue,
//       totalProfit,
//       todaySells,
//       customersCount,
//     };
//   }, [tableData]);

//   const sellColumns = [
//     { key: "id", label: "المعرف", sortable: true, hidden: true },
//     { key: "productName", label: "المنتجات", sortable: true },
//     { key: "productCode", label: "الكود", sortable: true },
//     { key: "quantity", label: "الكمية", sortable: true },
//     { key: "customerName", label: "العميل", sortable: true },
//     { key: "invoiceNumber", label: "رقم الفاتورة", sortable: true },
//     { key: "totalPrice", label: "القيمة", sortable: true },
//     { key: "currency", label: "العملة", sortable: true },
//     { key: "amountBase", label: "القيمة الأساسية", sortable: true },
//     { key: "paymentStatus", label: "طريقة الدفع", sortable: true },
//     { key: "remainingDebt", label: "المتبقي", sortable: true },
//     { key: "warehouse", label: "المستودع", sortable: true },
//     { key: "profit", label: "الربح", sortable: true },
//     { key: "date", label: "التاريخ", sortable: true },
//   ];

//   return (
//     <div className="space-y-6" dir="rtl">
//       <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
//         <div>
//           <h1 className="text-2xl font-bold tracking-normal">المبيعات</h1>
//           <p className="text-sm text-muted-foreground">
//             متابعة فواتير البيع والمنتجات والكميات والقيم المرتبطة بها.
//           </p>
//         </div>

//         <Button
//           variant="outline"
//           className="w-full gap-2 md:w-auto"
//           onClick={() => refetch()}
//           disabled={isFetching}
//         >
//           <RefreshCw
//             className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`}
//           />
//           تحديث
//         </Button>
//       </div>

//       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
//         <StatsCard
//           title="إجمالي الفواتير"
//           value={summary.totalSells}
//           icon={ShoppingCart}
//           loading={isLoading}
//         />
//         <StatsCard
//           title="الكميات المباعة"
//           value={summary.totalQuantity.toFixed(2)}
//           icon={PackageMinus}
//           loading={isLoading}
//         />
//         <StatsCard
//           title="مبيعات اليوم"
//           value={summary.todaySells}
//           icon={RefreshCw}
//           loading={isLoading}
//         />
//         <StatsCard
//           title="عدد العملاء"
//           value={summary.customersCount}
//           description={
//             summary.totalValue > 0
//               ? `القيمة: ${summary.totalValue.toFixed(2)} | الأساسية: ${summary.totalBaseValue.toFixed(2)} | الربح: ${summary.totalProfit.toFixed(2)}`
//               : undefined
//           }
//           icon={UserRound}
//           loading={isLoading}
//         />
//       </div>

//       {isError && (
//         <Alert variant="destructive">
//           <AlertCircle className="h-4 w-4" />
//           <AlertTitle>تعذر جلب المبيعات</AlertTitle>
//           <AlertDescription>
//             {error?.message ||
//               "حدث خطأ أثناء الاتصال بالخادم. حاول التحديث مرة أخرى."}
//           </AlertDescription>
//         </Alert>
//       )}

//       <DataTable
//         title="قائمة المبيعات"
//         description="يمكنك البحث والفرز حسب المنتج أو العميل أو رقم الفاتورة أو طريقة الدفع."
//         columns={sellColumns}
//         data={tableData}
//         isLoading={isLoading}
//         defaultPageSize={10}
//       />
//     </div>
//   );
// }
