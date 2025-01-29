import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CurrencyType } from "@/types/quotation";

interface VendorSectionProps {
  vendorName: string;
  setVendorName: (value: string) => void;
  vendorCost: number;
  setVendorCost: (value: number) => void;
  vendorCurrencyType: CurrencyType;
  setVendorCurrencyType: (value: CurrencyType) => void;
  vendors?: Array<{ id: string; name: string }>;
}

export function VendorSection({
  vendorName,
  setVendorName,
  vendorCost,
  setVendorCost,
  vendorCurrencyType,
  setVendorCurrencyType,
  vendors,
}: VendorSectionProps) {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="vendorName">Vendor Name</Label>
        <Input
          id="vendorName"
          value={vendorName}
          onChange={(e) => setVendorName(e.target.value)}
          list="vendorsList"
        />
        <datalist id="vendorsList">
          {vendors?.map((vendor) => (
            <option key={vendor.id} value={vendor.name} />
          ))}
        </datalist>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label>Vendor Currency Type</Label>
          <RadioGroup
            value={vendorCurrencyType}
            onValueChange={(value: CurrencyType) => setVendorCurrencyType(value)}
            className="flex gap-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="usd" id="vendor_usd" />
              <Label htmlFor="vendor_usd">USD</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="iqd" id="vendor_iqd" />
              <Label htmlFor="vendor_iqd">IQD</Label>
            </div>
          </RadioGroup>
        </div>

        <div className="space-y-2">
          <Label htmlFor="vendorCost">Vendor Cost</Label>
          <Input
            id="vendorCost"
            type="number"
            value={vendorCost}
            onChange={(e) => setVendorCost(Number(e.target.value))}
            required
          />
        </div>
      </div>
    </>
  );
}