import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface DiscountInputProps {
  discount: number;
  setDiscount: (value: number) => void;
}

export function DiscountInput({ discount, setDiscount }: DiscountInputProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="discount">Discount Amount</Label>
      <Input
        id="discount"
        type="number"
        min="0"
        value={discount}
        onChange={(e) => setDiscount(Number(e.target.value))}
      />
    </div>
  );
}