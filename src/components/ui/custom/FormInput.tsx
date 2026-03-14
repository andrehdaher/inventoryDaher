import React, { forwardRef } from "react";
import { Input } from "../input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type FormInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  options?: { id: string; name: string }[];
};

const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  ({ options, label, error, className, ...props }, ref) => {
    // ==========================
    //      SELECT MODE
    // ==========================
    if (options && options.length > 0 && props.value !== "other") {
      return (
        <div className="text-right">
          <label className="block mb-1 text-sm font-medium">{label}</label>

          <Select
            value={props.value ? String(props.value) : ""}
            onValueChange={(v) => {
              // ⚠️ نرسل value بشكل متوافق مع RHF
              props.onChange?.({
                target: { value: v },
              } as any);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="اختر خيارًا" />
            </SelectTrigger>

            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.id} value={option.id}>
                  {option.name}
                </SelectItem>
              ))}
              {/* <SelectItem value="other">غير ذلك</SelectItem> */}
            </SelectContent>
          </Select>

          {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
        </div>
      );
    }

    // ==========================
    //      INPUT MODE
    // ==========================
    return (
      <div className="text-right">
        <label className="block mb-1 text-sm font-medium text-foreground">
          {label}
        </label>

        <Input
          ref={ref} // ✅ الآن ref صحيح
          {...props} // ✅ name, onChange, onBlur تصل لـ RHF
          step="any"
          className={`text-right border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
            error ? "border-red-500" : ""
          } ${className || ""}`}
        />

        {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
      </div>
    );
  },
);

FormInput.displayName = "FormInput";

export default FormInput;
