import { TableCell, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Trash } from "lucide-react";
import { QuotationItem } from "@/types/quotation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ItemRowProps {
  item: QuotationItem;
  updateItem: (id: string, field: keyof QuotationItem, value: any) => void;
  removeItem: (id: string) => void;
  itemTypes: Array<{ id: string; name: string }>;
  formatNumber: (num: number) => string;
  onAddNewType: (itemId: string) => void;
}

export function ItemRow({
  item,
  updateItem,
  removeItem,
  itemTypes,
  formatNumber,
  onAddNewType,
}: ItemRowProps) {
  const handleTypeSelect = (value: string) => {
    if (value === "add_new") {
      onAddNewType(item.id);
    } else {
      updateItem(item.id, 'type_id', value);
    }
  };

  return (
    <TableRow className="[&>td]:px-1">
      <TableCell>
        <Input
          value={item.name}
          onChange={(e) => updateItem(item.id, 'name', e.target.value)}
          required
        />
      </TableCell>
      <TableCell>
        <Textarea
          value={item.description}
          onChange={(e) => updateItem(item.id, 'description', e.target.value)}
          className="min-h-[60px]"
        />
      </TableCell>
      <TableCell>
        <Input
          type="number"
          value={item.quantity}
          onChange={(e) => updateItem(item.id, 'quantity', Number(e.target.value))}
          required
          className="w-16"
        />
      </TableCell>
      <TableCell>
        <Select
          value={item.type_id || ""}
          onValueChange={handleTypeSelect}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select type..." />
          </SelectTrigger>
          <SelectContent>
            {itemTypes?.map((type) => (
              <SelectItem key={type.id} value={type.id}>
                {type.name}
              </SelectItem>
            ))}
            <SelectItem value="add_new">+ Add New Type</SelectItem>
          </SelectContent>
        </Select>
      </TableCell>
      <TableCell>
        <div className="relative">
          <Input
            type="number"
            value={item.unit_price}
            onChange={(e) => updateItem(item.id, 'unit_price', Number(e.target.value))}
            required
            className="pr-12"
          />
          <div className="absolute right-2 top-2 text-sm text-muted-foreground">
            {formatNumber(item.unit_price)}
          </div>
        </div>
      </TableCell>
      <TableCell className="text-right">
        {formatNumber(item.total_price)}
      </TableCell>
      <TableCell>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => removeItem(item.id)}
        >
          <Trash className="h-4 w-4" />
        </Button>
      </TableCell>
    </TableRow>
  );
}