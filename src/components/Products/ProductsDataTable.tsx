import { useNavigate } from "react-router-dom";
import { DataTable } from "../dashboard/DataTable";
import { Button } from "../ui/button";
import { Product } from "@/services/transaction";
import { ProductTableRow } from "@/pages/Products";

type productDataTableProp = {
  productsData: Product[] | ProductTableRow[];
  setEditRow: any;
  setOpenForm: any;
  setProductRow: any;
  setOpenTransfare: any;
  isLoading?: boolean
};

const ProductsDataTable = ({ productsData, setEditRow, setOpenForm, setOpenTransfare, setProductRow, isLoading }: productDataTableProp) => {
  const navigate = useNavigate();
  const ProductsColumns = [
    { key: "id", label: "المعرف", sortable: true, hidden: true },
    { key: "code", label: "الرمز", sortable: true },
    { key: "name", label: "الاسم", sortable: true },
    { key: "quantity", label: "الكمية", sortable: true },
    { key: "warehouse", label: "المخزن", sortable: true },
    { key: "payPrice", label: "سعر الشراء", sortable: true, onlyAdmin: true },
    { key: "sellPrice", label: "سعر المبيع", sortable: true },
    { key: "category", label: "الصنف", sortable: true },
    { key: "unit", label: "الواحدة", sortable: true },
  ];

  return (
    <>
      <DataTable
        isLoading={isLoading}
        title="قائمة المنتجات"
        titleButton={
          <Button
            onClick={() => {
              setEditRow(null);
              setOpenForm(true);
            }}
            className=""
          >
            إضافة منتج
          </Button>
        }
        columns={ProductsColumns}
        data={productsData}
        getRowClassName={(row) =>
          row.quantity === 0
            ? "bg-destructive/20 hover:bg-destructive/40"
            : row.quantity < 5
              ? "bg-yellow-500/20 hover:bg-yellow-500/40"
              : ""
        }
        renderRowActions={(row) => (
          <div className="flex gap-1">
            <Button
              variant="default"
              onClick={(e) => {
                e.stopPropagation();
                setEditRow(row);
                setOpenForm(true);
              }}
            >
              شراء
            </Button>

            <Button
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                navigate("/productDetails", { state: row });
              }}
            >
              التفاصيل
            </Button>

            <Button
              variant="secondary"
              onClick={(e) => {
                e.stopPropagation();
                setProductRow(row);
                setOpenTransfare(true);
              }}
            >
              نقل
            </Button>
          </div>
        )}
      />
    </>
  );
};

export default ProductsDataTable