import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TableHeaderProps {
  totalAmount: number;
  formatNumber: (num: number) => string;
  onAddItem: () => void;
}

export function TableHeader({ totalAmount, formatNumber, onAddItem }: TableHeaderProps) {
  return (
    <div className="flex justify-between items-center">
      <h2 className="text-xl font-semibold">Items</h2>
      <div className="flex items-center gap-4">
        <div className="text-sm text-muted-foreground">
          Total: {formatNumber(totalAmount)}
        </div>
        <Button type="button" onClick={onAddItem}>
          <Plus className="h-4 w-4 mr-2" />
          Add Item
        </Button>
      </div>
    </div>
  );
}