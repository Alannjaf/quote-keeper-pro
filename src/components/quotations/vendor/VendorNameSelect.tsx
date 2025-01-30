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
      <Label htmlFor="vendorName">Vendor Name</Label>
      <Select value={vendorName || "select"} onValueChange={setVendorName}>
        <SelectTrigger>
          <SelectValue placeholder="Select vendor..." />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="select" disabled>Select vendor...</SelectItem>
          {vendors?.map((vendor) => (
            <SelectItem key={vendor.id} value={vendor.name || vendor.id}>
              {vendor.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}