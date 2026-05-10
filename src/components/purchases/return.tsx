// import { useMemo } from "react";
// import {
//   AlertCircle,
//   PackageMinus,
//   RefreshCw,
//   RotateCcw,
//   UserRound,
// } from "lucide-react";
// import { useReturns, Return } from "@/hooks/useReturns";
// import { DataTable } from "../dashboard/DataTable";
// import { StatsCard } from "../dashboard/StatsCard";
// import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
// import { Button } from "../ui/button";

// export interface ReturnTableRow {
//   id: string;
//   productName: string;
//   productCode: string;
//   quantity: number;
//   reason: string;
//   partnerName: string;
//   returnSource: string;
//   invoiceNumber: string;
//   totalPrice: number;
//   date: string;
// }

// const emptyValue = "غير محدد";
// const supplierLabel = "مورد";
// const customerLabel = "عميل";

// const toNumber = (value: unknown) => {
//   const numericValue = Number(value);
//   return Number.isFinite(numericValue) ? numericValue : 0;
// };

// const getReturnDate = (item: Return) =>
//   item.createdDate || item.date || item.createdAt || "";

// const normalizeDateText = (value: string) =>
//   value
//     .replace(/[\u200e\u200f\u061c]/g, "")
//     .replace("،", ",")
//     .replace("ص", "AM")
//     .replace("م", "PM")
//     .trim();

// const parseReturnDate = (value: string) => {
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
//   const time = parseReturnDate(value);
//   if (!time) return false;

//   const date = new Date(time);
//   const today = new Date();

//   return (
//     date.getFullYear() === today.getFullYear() &&
//     date.getMonth() === today.getMonth() &&
//     date.getDate() === today.getDate()
//   );
// };

// const isSupplierReturn = (item: Return) =>
//   item.returnSource === "supplier" || Boolean(item.supplierId || item.supplierName || item.supplier?.name);

// export default function ReturnComponent() {
//   const {
//     data: returns = [],
//     isLoading,
//     isError,
//     error,
//     refetch,
//     isFetching,
//   } = useReturns();

//   const tableData: ReturnTableRow[] = useMemo(
//     () =>
//       returns.map((item) => {
//         const supplierName =
//           item.supplierName || item.supplier?.name || item.supplierId;
//         const customerName =
//           item.customerName || item.customer?.name || item.customerId;
//         const returnSource = isSupplierReturn(item)
//           ? supplierLabel
//           : customerLabel;

//         return {
//           id: item.id?.toString() || "",
//           productName:
//             item.productName || item.product?.name || item.name || emptyValue,
//           productCode:
//             item.product?.code || item.productCode || item.code || emptyValue,
//           quantity: toNumber(item.quantity) || toNumber(item.qty),
//           reason: item.reason || emptyValue,
//           partnerName:
//             returnSource === supplierLabel
//               ? supplierName || emptyValue
//               : customerName || emptyValue,
//           returnSource,
//           invoiceNumber:
//             item.invoiceNumber ||
//             item.referenceId ||
//             item.sellId?.toString() ||
//             item.purchaseId?.toString() ||
//             emptyValue,
//           totalPrice: toNumber(item.returnValue) || toNumber(item.totalPrice),
//           date: getReturnDate(item),
//         };
//       }),
//     [returns],
//   );

//   const summary = useMemo(() => {
//     const totalQuantity = tableData.reduce(
//       (sum, item) => sum + item.quantity,
//       0,
//     );
//     const totalValue = tableData.reduce((sum, item) => sum + item.totalPrice, 0);
//     const todayReturns = tableData.filter((item) => isToday(item.date)).length;
//     const supplierReturns = tableData.filter(
//       (item) => item.returnSource === supplierLabel,
//     ).length;
//     const customerReturns = tableData.filter(
//       (item) => item.returnSource === customerLabel,
//     ).length;
//     const partnersCount = new Set(
//       tableData
//         .map((item) => item.partnerName)
//         .filter((name) => name && name !== emptyValue),
//     ).size;

//     return {
//       totalReturns: tableData.length,
//       totalQuantity,
//       totalValue,
//       todayReturns,
//       partnersCount,
//       supplierReturns,
//       customerReturns,
//     };
//   }, [tableData]);

//   const returnColumns = [
//     { key: "id", label: "المعرف", sortable: true, hidden: true },
//     { key: "productName", label: "المنتج", sortable: true },
//     { key: "productCode", label: "الكود", sortable: true },
//     { key: "quantity", label: "الكمية", sortable: true },
//     { key: "reason", label: "سبب الإرجاع", sortable: true },
//     { key: "partnerName", label: "العميل / المورد", sortable: true },
//     { key: "returnSource", label: "النوع", sortable: true },
//     { key: "invoiceNumber", label: "الفاتورة المرجعية", sortable: true },
//     { key: "totalPrice", label: "القيمة", sortable: true },
//     { key: "date", label: "التاريخ", sortable: true },
//   ];

//   return (
//     <div className="space-y-6" dir="rtl">
//       <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
//         <div>
//           <h1 className="text-2xl font-bold tracking-normal">المرتجعات</h1>
//           <p className="text-sm text-muted-foreground">
//             متابعة عمليات الإرجاع والكميات والقيم المرتبطة بها.
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
//           title="إجمالي المرتجعات"
//           value={summary.totalReturns}
//           description={`عملاء: ${summary.customerReturns} | موردين: ${summary.supplierReturns}`}
//           icon={RotateCcw}
//           loading={isLoading}
//         />
//         <StatsCard
//           title="الكميات المرجعة"
//           value={summary.totalQuantity.toFixed(2)}
//           icon={PackageMinus}
//           loading={isLoading}
//         />
//         <StatsCard
//           title="مرتجعات اليوم"
//           value={summary.todayReturns}
//           icon={RefreshCw}
//           loading={isLoading}
//         />
//         <StatsCard
//           title="عدد العملاء والموردين"
//           value={summary.partnersCount}
//           description={
//             summary.totalValue > 0
//               ? `قيمة المرتجعات: ${summary.totalValue.toFixed(2)}`
//               : undefined
//           }
//           icon={UserRound}
//           loading={isLoading}
//         />
//       </div>

//       {isError && (
//         <Alert variant="destructive">
//           <AlertCircle className="h-4 w-4" />
//           <AlertTitle>تعذر جلب المرتجعات</AlertTitle>
//           <AlertDescription>
//             {error?.message ||
//               "حدث خطأ أثناء الاتصال بالخادم. حاول التحديث مرة أخرى."}
//           </AlertDescription>
//         </Alert>
//       )}

//       <DataTable
//         title="قائمة المرتجعات"
//         description="يمكنك البحث والفرز حسب المنتج أو العميل أو المورد أو رقم الفاتورة."
//         columns={returnColumns}
//         data={tableData}
//         isLoading={isLoading}
//         defaultPageSize={10}
//       />
//     </div>
//   );
// }
