import { DataTable } from '@/components/dashboard/DataTable';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import SupplierSelect from '@/components/Products/SupplierSelect';
import { Button } from '@/components/ui/button';
import PopupForm from '@/components/ui/custom/PopupForm';
import getAllSupplier from '@/services/supplier';
import { useQuery } from '@tanstack/react-query';
import { HandCoins } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Suppliers() {

    const navigate = useNavigate()
    const [openSupplier, setOpenSupplier] = useState(false);
    const [supplierId, setSupplierId] = useState<string | number | null>(null);


    const { data: suppliers, isLoading: suppliersLoading } = useQuery({
        queryKey: ["suppliers-table"],
        queryFn: getAllSupplier,
    })

    const supplierColumns = [
        { key: "id", label: "الرمز", sortable: true, hidden: true },
        { key: "name", label: "الاسم", sortable: true },
        { key: "number", label: "الرقم", sortable: true },
        { key: "balance", label: "الرصيد", sortable: true },
        { key: "purchasesCount", label: "عدد عمليات الشراء", sortable: true },
        { key: "updatedDate", label: "اخر عملية", sortable: true },
    ];

    const suppliersDebt = useMemo(() => {
        return suppliers
            ?.filter((c) => c.balance > 0)
            .reduce((sum, c) => sum + Number(c.balance), 0) || 0;
    },  [suppliers])


    return (
        <DashboardLayout>
            {/* البطاقات الإحصائية */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatsCard
                    title="ديون للموردين"
                    value={suppliersDebt.toFixed(2) || 0}
                    icon={HandCoins}
                    loading={suppliersLoading}
                />
            </div>
            <DataTable
                isLoading={suppliersLoading}
                title='الموردين'
                titleButton={
                    <PopupForm
                        isOpen={openSupplier}
                        setIsOpen={setOpenSupplier}
                        title='اضافة مورد'
                        trigger={
                            <Button className='w-full'>
                                اضافة مورد
                            </Button>
                        }
                    >
                        <SupplierSelect
                            className='mt-6'
                            isOpen={openSupplier}
                            setIsOpen={setOpenSupplier}
                            supplierId={supplierId}
                            setSupplierId={setSupplierId}
                            withDataTable={true}
                        />
                    </PopupForm>
                }
                columns={supplierColumns}
                data={suppliers ?
                    Object.values(suppliers).map(supplier => {
                        if (typeof supplier === 'object') {
                            return {
                                ...supplier,
                                purchasesCount: (supplier as any).purchases?.length ?? 0
                            };
                        }
                        return supplier;
                    })
                : []}
                onRowClick={(row) => {
                    navigate("/SupplierDetails", {
                        state: { id: row.id },
                    });
                }}

            />
        </DashboardLayout>
    )
}
