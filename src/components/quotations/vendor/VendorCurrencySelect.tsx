import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CurrencyType } from "@/types/quotation";

interface VendorCurrencySelectProps {
  vendorCurrencyType: CurrencyType;
  setVendorCurrencyType: (value: CurrencyType) => void;
}

export function VendorCurrencySelect({
  vendorCurrencyType,
  setVendorCurrencyType,
}: VendorCurrencySelectProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="vendorCurrencyType">Currency</Label>
      <Select
        value={vendorCurrencyType}
        onValueChange={(value: CurrencyType) => setVendorCurrencyType(value)}
      >
        <SelectTrigger id="vendorCurrencyType">
          <SelectValue placeholder="Select currency" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="usd">USD</SelectItem>
          <SelectItem value="iqd">IQD</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}