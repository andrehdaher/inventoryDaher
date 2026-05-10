import React from "react";
import {useGetAccount}  from "@/hooks/useAccount";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Props {
  value?: string;
  onChange: (value: string) => void;
  label?: string;
  error?: string;
  filterType?:
    | "inventory"
    | "payable"
    | "payment"
    | "receivable"
    | "sales"
    | "expense"
    | "all";
}

export default function AccountSelect({
  value,
  onChange,
  label,
  error,
  filterType = "all",
}: Props) {
  const { data: accounts = [] } = useGetAccount();

  const filteredAccounts = accounts.filter((acc: any) => {
    if (filterType === "inventory") {
      return acc.category === "Inventory" || acc.type === "Asset";
    }

    if (filterType === "payable") {
      return acc.category === "AccountsPayable" || acc.type === "Liability";
    }

    if (filterType === "payment") {
      return acc.category === "Cash" || acc.category === "Bank";
    }

    if (filterType === "receivable") {
      return acc.category === "AccountsReceivable";
    }

    if (filterType === "sales") {
      return acc.type === "Revenue" || acc.category === "Revenue";
    }

    if (filterType === "expense") {
      return acc.type === "Expense" || acc.category === "Expense";
    }

    return true;
  });

  return (
    <div>
      {label && (
        <label className="block mb-1 text-sm font-medium">
          {label}
        </label>
      )}

      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder="اختر الحساب" />
        </SelectTrigger>

        <SelectContent>
          {filteredAccounts.map((acc: any) => (
            <SelectItem key={acc.id} value={acc.id}>
              {acc.name} ({acc.code})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
    </div>
  );
}
