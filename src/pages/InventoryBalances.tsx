import { DataTable } from "@/components/dashboard/DataTable";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Loading from "@/components/ui/custom/Loading";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import getAllProducts from "@/services/products";
import { getAllWarehouses } from "@/services/warehouse";
import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  Boxes,
  Package,
  PackageX,
  ShoppingCart,
  Warehouse,
} from "lucide-react";
import { useMemo, useState } from "react";

interface ProductRecord {
  id?: string;
  code?: string;
  name?: string;
  category?: string;
  warehouse?: string;
  payPrice?: number | string;
  sellPrice?: number | string;
  quantity?: number | string;
  unit?: string;
  updatedDate?: string;
  minQuantity?: number | string;
  lowStockLimit?: number | string;
  alertQuantity?: number | string;
  actualQuantity?: number | string;
  physicalQuantity?: number | string;
  inventoryCount?: number | string;
  countedQuantity?: number | string;
  stocktakeQuantity?: number | string;
  realQuantity?: number | string;
}

interface WarehouseRecord {
  id?: string;
  name?: string;
}

interface InventoryRow {
  id: string;
  code: string;
  name: string;
  category: string;
  warehouse: string;
  quantity: number;
  unit: string;
  payPrice: number;
  sellPrice: number;
  purchaseValue: number;
  saleValue: number;
  alertLimit: number;
  stockStatus: string;
  inventoryDifference: string | number;
  updatedDate: string;
}

const detailColumns = [
  { key: "id", label: "المعرف", hidden: true },
  { key: "code", label: "الكود", sortable: true },
  { key: "name", label: "المنتج", sortable: true },
  { key: "category", label: "التصنيف", sortable: true },
  { key: "warehouse", label: "المستودع", sortable: true },
  { key: "quantity", label: "الكمية", sortable: true },
  { key: "unit", label: "الوحدة", sortable: true },
  { key: "payPrice", label: "سعر الشراء", sortable: true },
  { key: "sellPrice", label: "سعر البيع", sortable: true },
  { key: "purchaseValue", label: "قيمة الشراء", sortable: true },
  { key: "saleValue", label: "قيمة البيع", sortable: true },
  { key: "alertLimit", label: "حد التنبيه", sortable: true },
  { key: "stockStatus", label: "الحالة", sortable: true },
  { key: "inventoryDifference", label: "فرق الجرد", sortable: true },
  { key: "updatedDate", label: "آخر تحديث", sortable: true },
];

const warehouseColumns = [
  { key: "id", label: "المعرف", hidden: true },
  { key: "warehouse", label: "المستودع", sortable: true },
  { key: "productsCount", label: "عدد المنتجات", sortable: true },
  { key: "totalQuantity", label: "إجمالي الكمية", sortable: true },
  { key: "purchaseValue", label: "قيمة المخزون شراء", sortable: true },
  { key: "saleValue", label: "قيمة المخزون بيع", sortable: true },
  { key: "outOfStockCount", label: "نافدة", sortable: true },
  { key: "lowStockCount", label: "تحت التنبيه", sortable: true },
  { key: "inventoryDifference", label: "فرق الجرد", sortable: true },
];

const emptyValue = "غير محدد";

const toNumber = (value: unknown) => {
  const numericValue = Number(value || 0);
  return Number.isFinite(numericValue) ? numericValue : 0;
};

const round2 = (value: number) => Math.round(value * 100) / 100;

const formatAmount = (value: number) =>
  value.toLocaleString("en-US", {
    maximumFractionDigits: 2,
  });

const normalizeProducts = (data: any): ProductRecord[] => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.products)) return data.products;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.data?.products)) return data.data.products;
  return [];
};

const normalizeWarehouses = (data: any): WarehouseRecord[] => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.warehouses)) return data.warehouses;
  if (Array.isArray(data?.data)) return data.data;
  return [];
};

const getProductAlertLimit = (product: ProductRecord, defaultLimit: number) => {
  const explicitLimit =
    product.alertQuantity ?? product.lowStockLimit ?? product.minQuantity;
  const limit = Number(explicitLimit);
  return Number.isFinite(limit) && explicitLimit !== undefined
    ? limit
    : defaultLimit;
};

const getActualQuantity = (product: ProductRecord) => {
  const candidates = [
    product.actualQuantity,
    product.physicalQuantity,
    product.inventoryCount,
    product.countedQuantity,
    product.stocktakeQuantity,
    product.realQuantity,
  ];

  const value = candidates.find(
    (candidate) => candidate !== undefined && candidate !== null && candidate !== "",
  );

  if (value === undefined) return undefined;

  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : undefined;
};

const getStockStatus = (quantity: number, alertLimit: number) => {
  if (quantity <= 0) return "نافد";
  if (quantity <= alertLimit) return "تحت حد التنبيه";
  return "متوفر";
};

export default function InventoryBalances() {
  const [warehouseFilter, setWarehouseFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");
  const [alertLimit, setAlertLimit] = useState(5);

  const { data, isLoading } = useQuery({
    queryKey: ["inventory-balances"],
    queryFn: async () => {
      const [products, warehouses] = await Promise.all([
        getAllProducts(),
        getAllWarehouses(),
      ]);

      return {
        products: normalizeProducts(products),
        warehouses: normalizeWarehouses(warehouses),
      };
    },
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

  const rows = useMemo<InventoryRow[]>(() => {
    return (data?.products || []).map((product, index) => {
      const quantity = toNumber(product.quantity);
      const payPrice = toNumber(product.payPrice);
      const sellPrice = toNumber(product.sellPrice);
      const rowAlertLimit = getProductAlertLimit(product, alertLimit);
      const actualQuantity = getActualQuantity(product);
      const inventoryDifference =
        actualQuantity === undefined ? "-" : round2(actualQuantity - quantity);

      return {
        id: product.id || `${product.code || "product"}-${product.warehouse || index}`,
        code: product.code || emptyValue,
        name: product.name || emptyValue,
        category: product.category || emptyValue,
        warehouse: product.warehouse || emptyValue,
        quantity,
        unit: product.unit || emptyValue,
        payPrice,
        sellPrice,
        purchaseValue: round2(quantity * payPrice),
        saleValue: round2(quantity * sellPrice),
        alertLimit: rowAlertLimit,
        stockStatus: getStockStatus(quantity, rowAlertLimit),
        inventoryDifference,
        updatedDate: product.updatedDate || "",
      };
    });
  }, [alertLimit, data?.products]);

  const categories = useMemo(
    () =>
      Array.from(
        new Set(rows.map((row) => row.category).filter((value) => value !== emptyValue)),
      ),
    [rows],
  );

  const warehouses = useMemo(() => {
    const warehouseNames = normalizeWarehouses(data?.warehouses)
      .map((warehouse) => warehouse.name)
      .filter(Boolean) as string[];

    return Array.from(
      new Set([
        ...warehouseNames,
        ...rows
          .map((row) => row.warehouse)
          .filter((value) => value && value !== emptyValue),
      ]),
    );
  }, [data?.warehouses, rows]);

  const filteredRows = useMemo(() => {
    let items = rows;

    if (warehouseFilter !== "all") {
      items = items.filter((row) => row.warehouse === warehouseFilter);
    }

    if (categoryFilter !== "all") {
      items = items.filter((row) => row.category === categoryFilter);
    }

    if (stockFilter === "out") {
      items = items.filter((row) => row.quantity <= 0);
    }

    if (stockFilter === "low") {
      items = items.filter(
        (row) => row.quantity > 0 && row.quantity <= row.alertLimit,
      );
    }

    if (stockFilter === "difference") {
      items = items.filter((row) => row.inventoryDifference !== "-");
    }

    return items;
  }, [categoryFilter, rows, stockFilter, warehouseFilter]);

  const totals = useMemo(() => {
    const totalQuantity = filteredRows.reduce((sum, row) => sum + row.quantity, 0);
    const purchaseValue = filteredRows.reduce(
      (sum, row) => sum + row.purchaseValue,
      0,
    );
    const saleValue = filteredRows.reduce((sum, row) => sum + row.saleValue, 0);
    const outOfStockCount = filteredRows.filter((row) => row.quantity <= 0).length;
    const lowStockCount = filteredRows.filter(
      (row) => row.quantity > 0 && row.quantity <= row.alertLimit,
    ).length;
    const inventoryDifference = filteredRows.reduce(
      (sum, row) =>
        row.inventoryDifference === "-"
          ? sum
          : sum + Number(row.inventoryDifference || 0),
      0,
    );

    return {
      productsCount: filteredRows.length,
      totalQuantity,
      purchaseValue,
      saleValue,
      outOfStockCount,
      lowStockCount,
      inventoryDifference,
    };
  }, [filteredRows]);

  const warehouseRows = useMemo(() => {
    const grouped = new Map<string, any>();

    filteredRows.forEach((row) => {
      const previous = grouped.get(row.warehouse) || {
        id: row.warehouse,
        warehouse: row.warehouse,
        productsCount: 0,
        totalQuantity: 0,
        purchaseValue: 0,
        saleValue: 0,
        outOfStockCount: 0,
        lowStockCount: 0,
        inventoryDifference: 0,
        hasInventoryDifference: false,
      };

      previous.productsCount += 1;
      previous.totalQuantity += row.quantity;
      previous.purchaseValue += row.purchaseValue;
      previous.saleValue += row.saleValue;
      if (row.quantity <= 0) previous.outOfStockCount += 1;
      if (row.quantity > 0 && row.quantity <= row.alertLimit) {
        previous.lowStockCount += 1;
      }
      if (row.inventoryDifference !== "-") {
        previous.inventoryDifference += Number(row.inventoryDifference || 0);
        previous.hasInventoryDifference = true;
      }

      grouped.set(row.warehouse, previous);
    });

    return Array.from(grouped.values())
      .map((row) => ({
        id: row.id,
        warehouse: row.warehouse,
        productsCount: row.productsCount,
        totalQuantity: round2(row.totalQuantity),
        purchaseValue: round2(row.purchaseValue),
        saleValue: round2(row.saleValue),
        outOfStockCount: row.outOfStockCount,
        lowStockCount: row.lowStockCount,
        inventoryDifference: row.hasInventoryDifference
          ? round2(row.inventoryDifference)
          : "-",
      }))
      .sort((a, b) => b.purchaseValue - a.purchaseValue);
  }, [filteredRows]);

  const resetFilters = () => {
    setWarehouseFilter("all");
    setCategoryFilter("all");
    setStockFilter("all");
    setAlertLimit(5);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6" dir="rtl">
        <div>
          <h1 className="text-3xl font-bold">أرصدة البضاعة</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            متابعة كميات المنتجات في المستودعات وقيمة المخزون بسعر الشراء والبيع.
          </p>
        </div>

        {isLoading ? (
          <Loading />
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <StatsCard
                title="عدد أرصدة المنتجات"
                value={totals.productsCount.toLocaleString("en-US")}
                icon={Boxes}
              />
              <StatsCard
                title="إجمالي الكميات"
                value={formatAmount(totals.totalQuantity)}
                icon={Package}
              />
              <StatsCard
                title="قيمة المخزون شراء"
                value={formatAmount(totals.purchaseValue)}
                icon={ShoppingCart}
              />
              <StatsCard
                title="قيمة المخزون بيع"
                value={formatAmount(totals.saleValue)}
                icon={Warehouse}
              />
              <StatsCard
                title="منتجات نفدت"
                value={totals.outOfStockCount.toLocaleString("en-US")}
                icon={PackageX}
              />
              <StatsCard
                title="تحت حد التنبيه"
                value={totals.lowStockCount.toLocaleString("en-US")}
                icon={AlertTriangle}
              />
              <StatsCard
                title="فرق الجرد"
                value={formatAmount(totals.inventoryDifference)}
                icon={AlertTriangle}
                description="يظهر عند توفر كمية جرد فعلية"
              />
            </div>

            <Card>
              <CardHeader>
                <CardTitle>الفلاتر</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
                <Select value={warehouseFilter} onValueChange={setWarehouseFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="المستودع" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">كل المستودعات</SelectItem>
                    {warehouses.map((warehouse) => (
                      <SelectItem key={warehouse} value={warehouse}>
                        {warehouse}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="التصنيف" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">كل التصنيفات</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={stockFilter} onValueChange={setStockFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="حالة المخزون" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">كل الحالات</SelectItem>
                    <SelectItem value="out">منتجات نفدت</SelectItem>
                    <SelectItem value="low">تحت حد التنبيه</SelectItem>
                    <SelectItem value="difference">يوجد فرق جرد</SelectItem>
                  </SelectContent>
                </Select>

                <Input
                  type="number"
                  min={0}
                  value={alertLimit}
                  onChange={(event) => setAlertLimit(Number(event.target.value || 0))}
                  placeholder="حد التنبيه"
                />

                <Button variant="outline" onClick={resetFilters}>
                  مسح الفلاتر
                </Button>
              </CardContent>
            </Card>

            <Tabs defaultValue="details" className="space-y-4">
              <TabsList className="flex h-auto flex-wrap justify-start">
                <TabsTrigger value="details">تفاصيل المنتجات</TabsTrigger>
                <TabsTrigger value="warehouses">ملخص المستودعات</TabsTrigger>
              </TabsList>

              <TabsContent value="details">
                <DataTable
                  title="أرصدة المنتجات حسب المستودع"
                  columns={detailColumns}
                  data={filteredRows}
                  defaultPageSize={10}
                  pageSizeOptions={[10, 20, 50]}
                  getRowClassName={(row) =>
                    row.quantity <= 0
                      ? "bg-destructive/15 hover:bg-destructive/25"
                      : row.quantity <= row.alertLimit
                        ? "bg-yellow-500/15 hover:bg-yellow-500/25"
                        : ""
                  }
                />
              </TabsContent>

              <TabsContent value="warehouses">
                <DataTable
                  title="ملخص أرصدة المستودعات"
                  columns={warehouseColumns}
                  data={warehouseRows}
                  defaultPageSize={10}
                  pageSizeOptions={[10, 20, 50]}
                />
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
