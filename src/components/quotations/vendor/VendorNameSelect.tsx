import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface VendorNameSelectProps {
  vendorName: string;
  setVendorName: (value: string) => void;
  vendors?: Array<{ id: string; name: string }>;
}

export function VendorNameSelect({
  vendorName,
  setVendorName,
  vendors = [],
}: VendorNameSelectProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="vendor">Vendor</Label>
      <Select value={vendorName} onValueChange={setVendorName}>
        <SelectTrigger>
          <SelectValue placeholder="Select vendor..." />
        </SelectTrigger>
        <SelectContent>
          {vendors?.map((vendor) => (
            <SelectItem key={`vendor-${vendor.id}`} value={vendor.name || vendor.id}>
              {vendor.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}