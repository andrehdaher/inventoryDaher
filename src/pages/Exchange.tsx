import { DataTable } from '@/components/dashboard/DataTable';
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Button } from '@/components/ui/button';
import FormInput from '@/components/ui/custom/FormInput';
import PopupForm from '@/components/ui/custom/PopupForm';
import { getAllDoneExchange, getAllExchange } from '@/services/exchange';
import { endExchange } from '@/services/transaction';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'sonner';


export default function Exchange() {

    const [isOpen, setIsOpen] = useState(false)
    const [amountFinal, setAmountFinal] = useState(0)
    const [finalRate, setFinalRate] = useState(0)
    const queryClient = useQueryClient();

    const { data: exchange, isLoading: exchangeLoading } = useQuery({
        queryKey: ["exchange-table"],
        queryFn: () => getAllExchange(),
    });
    
    const { data: doneExchange, isLoading: doneExchangeLoading } = useQuery({
        queryKey: ["doneExchange-table"],
        queryFn: () => getAllDoneExchange(),
    });

    const exchangeColumns = [
        { label: "ID", key: "id", hidden: true, sortable: true },
        { label: "المبلغ من", key: "amount_from", sortable: true },
        { label: "العملة من", key: "fromCurrency", sortable: true },
        { label: "المبلغ إلى", key: "amount_to", sortable: true },
        { label: "العملة إلى", key: "toCurrency", sortable: true },
        { label: "سعر الصرف", key: "rate", sortable: true },
        { label: "التاريخ", key: "date", sortable: true },
    ];

    const doneExchangeColumns = [
        { label: "ID", key: "id", hidden: true, sortable: true },
        { label: "المبلغ بعد التحويل", key: "amount_final", sortable: true },
        { label: "سعر التحويل", key: "finalRate", sortable: true },
        { label: "الفرق عن المتوقع", key: "exchangeDifference", sortable: true },
        { label: "المبلغ من", key: "amount_from", sortable: true },
        { label: "العملة من", key: "fromCurrency", sortable: true },
        { label: "المبلغ إلى", key: "amount_to", sortable: true },
        { label: "العملة إلى", key: "toCurrency", sortable: true },
        { label: "سعر الصرف", key: "rate", sortable: true },
        { label: "التاريخ", key: "date", sortable: true },
    ];

    const endExchangeMutation = useMutation({
        mutationFn: (dataToSend: any) => endExchange(dataToSend as any),
        onSuccess: () => {
            toast.success("تم إضافة الدفعة بنجاح!");
            setAmountFinal(0);
            setFinalRate(0);
            setIsOpen(false)
            queryClient.invalidateQueries({ queryKey: ['exchange-table'] });
            queryClient.invalidateQueries({ queryKey: ['doneExchange-table'] });
        },
        onError: (error) => {
          console.error(error);
          toast.error("حدث خطأ أثناء إنهاء التحويل");
        }
    });
    
    const handleSubmit = async (e: React.FormEvent, row) => {
        e.preventDefault();

        try {

            endExchangeMutation.mutate({
                exchangeData: row,
                realRate: finalRate,
                amount_final: amountFinal,
                id: row.id
            })
            
        } catch (err) {
            console.error("حدث خطأ أثناء إنهاء التحويل:", err);
        }
    }

    return (
        <DashboardLayout>
            <DataTable  
                title='عمليات بحاجة الى تحويل'
                data={exchange ? exchange : []}
                columns={exchangeColumns}
                renderRowActions={row => { return (
                    <PopupForm
                        title='انهاء عملية التحويل'
                        isOpen={isOpen}
                        setIsOpen={setIsOpen}
                        trigger={
                            <Button>
                                تحويل
                            </Button>
                        }
                    >
                        <DataTable
                            searchable={false}
                            title=''
                            data={[row]}
                            pageSizeOptions={[1]}
                            defaultPageSize={1}
                            columns={exchangeColumns}
                        />
                        <form className='space-y-4' onSubmit={e => handleSubmit(e, row)} action="">
                            <FormInput
                                label='القيمة المدفوعة للتحويل'
                                value={amountFinal}
                                onChange={e => setAmountFinal(Number(e.target.value))}
                            />
                            <FormInput
                                label='سعر التحويل'
                                value={finalRate}
                                onChange={e => setFinalRate(Number(e.target.value))}
                            />
                            <Button
                                className='w-full'
                                type='submit'
                            >
                                انهاء العملية
                            </Button>
                        </form>
                    </PopupForm>
                )}}
            />

            <DataTable
                title='عمليات التحويل المنتهية'
                data={doneExchange ? doneExchange : []}
                columns={doneExchangeColumns}
            />
        </DashboardLayout>
    )
}
