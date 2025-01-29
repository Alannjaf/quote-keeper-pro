import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CurrencyType } from "@/types/quotation";

interface CurrencyTypeSelectProps {
  value: CurrencyType;
  onChange: (value: CurrencyType) => void;
}

export function CurrencyTypeSelect({ value, onChange }: CurrencyTypeSelectProps) {
  return (
    <div className="space-y-2">
      <Label>Quotation Currency Type</Label>
      <RadioGroup
        value={value}
        onValueChange={(value: CurrencyType) => onChange(value)}
        className="flex gap-4"
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="usd" id="usd" />
          <Label htmlFor="usd">USD</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="iqd" id="iqd" />
          <Label htmlFor="iqd">IQD</Label>
        </div>
      </RadioGroup>
    </div>
  );
}