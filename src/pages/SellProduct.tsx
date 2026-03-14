import AddCustomerForm from '@/components/Customers/AddCustomerForm'
import { DataTable } from '@/components/dashboard/DataTable'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import ProductsTable from '@/components/sellProduct/ProductsTable'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import FormInput from '@/components/ui/custom/FormInput'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import getAllCustomer from '@/services/customer'
import getAllProducts from '@/services/products'
import { sell, sellProducts } from '@/services/transaction'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import React, { useEffect, useState } from 'react'
import { toast } from 'sonner'

export default function SellProduct() {

  const [isOpen, setIsOpen] = React.useState(false)
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [discount, setDiscount] = useState('');
  const [Amount, setAmount] = useState('');
  const [finalAmount, setFinalAmount] = useState(0);
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const [isDebt, setIsDebt] = useState<'cash' | 'part' | 'debt'>('cash');
  const [partValue, setPartValue] = useState('');
  const queryClient = useQueryClient();
  const [currency, setCurrency] = useState('')
  const [exchangeRate, setExchangeRate] = useState(1)


  const sellProductMutation = useMutation({
      mutationFn: (dataToSend: sell) => sellProducts({ newSell: dataToSend }),
      onSuccess: () => {
        toast.success("تم بيع المنتج بنجاح!");

        setSelectedProducts([]);
        setDiscount('');
        setAmount('');
        setFinalAmount(0);
        setSelectedRows([]);
        setIsDebt('cash');
        setPartValue('');

        queryClient.invalidateQueries({
          queryKey: ['sells-table'],
        });
      },
      onError: (error) => {
        console.error(error);
        toast.error("حدث خطأ أثناء بيع المنتج");
      }
  });



  const isRowSelected = (row: any) => {
    return selectedRows.some((r) => JSON.stringify(r) === JSON.stringify(row));
  };

  const toggleRowSelection = (row: any) => {
  setSelectedRows((prev) => {
    const isSelected = isRowSelected(row);
      if (isSelected) {
        return prev.filter((r) => JSON.stringify(r) !== JSON.stringify(row));
      } else {
        return [row];
      }
    });
  };

  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: ["products-table"],
    queryFn: getAllProducts,
  });

  useEffect(() => {
    setFinalAmount(Number((Number(Amount) - Number(discount)).toFixed(3)))
  }, [discount, Amount]);

  const { data: customers, isLoading: customersLoading } = useQuery({
    queryKey: ["customers-table"],
    queryFn: getAllCustomer,
  });
  const customerColumns = [
    { key: "id", label: "الرمز", sortable: true, hidden: true },
    { key: "name", label: "الاسم", sortable: true },
    { key: "number", label: "الرقم", sortable: true },
  ];

  
  return (
    <DashboardLayout>
      <Card>
        <CardHeader>
          <h1 className='text-2xl font-bold'>بيع المنتجات</h1>
        </CardHeader>
        <CardContent className='grid grid-cols-1 md:grid-cols-3 gap-2'>
          <div className='md:col-span-1'>
            <DataTable
              title='الزبائن'
              titleButton={<AddCustomerForm
                isOpen={isOpen}
                setIsOpen={setIsOpen}
                className='w-full mb-2'
              />}
              columns={customerColumns || []}
              data={customers || []}
              onRowClick={(row) => toggleRowSelection(row)}
              getRowClassName={(row) =>
                selectedRows?.some(r => r === row)
                  ? "bg-green-50 hover:bg-green-100"
                  : ""
              }
            />
          </div>
          <div className='md:col-span-2'>
            <ProductsTable 
              products={products} 
              setAmount={setAmount}
              onChange={(selected) => setSelectedProducts(selected)}
            />
          </div>

          <form
            className='md:col-span-3 mt-8 grid grid-cols-1 md:grid-cols-2 gap-3'
          >

            <FormInput
              label='الحسم'
              id='discount-amount'
              type='text'
              value={discount}
              onChange={e => setDiscount(e.target.value)}
            />

            <FormInput
              label='السعر النهائي'
              id='discount-amount'
              type='text'
              value={finalAmount.toString()}
              onChange={e => {}}
            />

            <div className='grid grid-cols-3 gap-2 md:col-span-2'>
            
              <Button onClick={()=>{setIsDebt('cash')}} className='col-span-1' variant={isDebt === 'cash' ? 'default' : 'outline'} type="button">نقدا</Button>
              <Button onClick={()=>{setIsDebt('part')}} className='col-span-1' variant={isDebt === 'part' ? 'default' : 'outline'} type="button">جزئي</Button>
              <Button onClick={()=>{setIsDebt('debt')}} className='col-span-1' variant={isDebt === 'debt' ? 'default' : 'outline'} type="button">دين</Button>

            </div>
            
            {isDebt === 'part' && <FormInput
              id='partPayment'
              label="قيمة الدفعة"
              value={partValue.toString()}
              onChange={(e) => setPartValue(e.target.value)}
            />}

            
            {!(isDebt == 'debt') && <> <Select value={currency} onValueChange={setCurrency}>
              <SelectTrigger className="w-full mt-6">
                <SelectValue placeholder="العملة المدفوع بها" />
              </SelectTrigger>
              <SelectContent>
                {(['SYP', 'USD'].map((c) => 
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>            
            <FormInput
              id='exchangeRate'
              label="سعر الصرف"
              value={currency == 'USD' ? 1 : exchangeRate}
              onChange={(e) => setExchangeRate(Number(e.target.value))}
              disabled={currency === "USD"}
            /></>}
            
            <Button 
              className='w-full md:col-span-2'
              variant='accent'
              onClick={(e) => {
                e.preventDefault()

                if(selectedRows.length <= 0){
                  toast.error('الرجاء التأكد من اختيار زبون')
                  return
                }
                
                sellProductMutation.mutate({
                  customerId: selectedRows.length > 0 ? selectedRows[0].id : "نقدي",
                  totalPrice: finalAmount,
                  products: selectedProducts,
                  paymentStatus: isDebt === 'cash' ? 'cash' : isDebt === 'part' ? 'part' : 'debt',
                  remainingDebt: isDebt === 'cash' ? 0 : isDebt === 'part' ? finalAmount - (currency == 'USD' ? Number(partValue) : Number((Number(partValue)/exchangeRate).toFixed(1))) : finalAmount,
                  currency: currency,
                  exchangeRate: exchangeRate,
                  amount_base: finalAmount * exchangeRate,
                  partValue: Number(partValue)
                })

              }}
            >اتمام عملية البيع</Button>
          </form>
        </CardContent>
      </Card>
    </DashboardLayout>
  )
}
