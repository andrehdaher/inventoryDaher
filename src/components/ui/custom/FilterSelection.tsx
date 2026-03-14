import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type FilterSelectionProps<T> = {
  DataToFilter: T[];
  selectedFilter: string;
  setSelectedFilter: (value: string) => void;
  FilterBy: keyof T;
  Placeholder: string;
};

export default function FilterSelection<T extends Record<string, any>>({
  DataToFilter,
  selectedFilter,
  setSelectedFilter,
  FilterBy,
  Placeholder,
}: FilterSelectionProps<T>) {
  const uniqueValues = Array.from(
    new Set(
      DataToFilter.map((item) => String(item[FilterBy] ?? "").trim()).filter(
        Boolean,
      ),
    ),
  );

  return (
    <Select value={selectedFilter} onValueChange={setSelectedFilter}>
      <SelectTrigger>
        <SelectValue placeholder={Placeholder} />
      </SelectTrigger>

      <SelectContent>
        <SelectItem value="all">الكل</SelectItem>

        {uniqueValues.map((value) => (
          <SelectItem key={value} value={value}>
            {value}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
