import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CurrencyType } from "@/types/quotation";

interface VendorCostInputProps {
  vendorCost: number;
  setVendorCost: (value: number) => void;
  vendorCurrencyType: CurrencyType;
  formatNumber: (num: number) => string;
  convertedCost: number;
  exchangeRate: number | null;
}

export function VendorCostInput({
  vendorCost,
  setVendorCost,
  vendorCurrencyType,
  formatNumber,
  convertedCost,
  exchangeRate,
}: VendorCostInputProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="vendorCost">Vendor Cost</Label>
      <div className="relative">
        <Input
          id="vendorCost"
          type="number"
          value={vendorCost}
          onChange={(e) => setVendorCost(Number(e.target.value))}
          required
          className="pr-20"
        />
        <div className="absolute right-2 top-2 text-sm text-muted-foreground">
          {formatNumber(vendorCost)} {vendorCurrencyType.toUpperCase()}
          {exchangeRate && (
            <div className="text-xs">
              ≈ {formatNumber(convertedCost)} {vendorCurrencyType === 'usd' ? 'IQD' : 'USD'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}