import { Table, TableBody } from "@/components/ui/table";
import { QuotationItem } from "@/types/quotation";
import { useState } from "react";
import { ItemsTableHeader } from "./items/ItemsTableHeader";
import { ItemRow } from "./items/ItemRow";
import { TableHeader } from "./items/table/TableHeader";
import { NewTypeDialog } from "./items/table/NewTypeDialog";

interface QuotationItemsTableProps {
  items: QuotationItem[];
  updateItem: (id: string, field: keyof QuotationItem, value: any) => void;
  removeItem: (id: string) => void;
  addNewItem: () => void;
  itemTypes?: Array<{ id: string; name: string }>;
  formatNumber: (num: number) => string;
}

export function QuotationItemsTable({
  items,
  updateItem,
  removeItem,
  addNewItem,
  itemTypes = [],
  formatNumber,
}: QuotationItemsTableProps) {
  const [isNewTypeDialogOpen, setIsNewTypeDialogOpen] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  const handleTypeDialogOpen = (itemId: string) => {
    setSelectedItemId(itemId);
    setIsNewTypeDialogOpen(true);
  };

  const totalAmount = items.reduce((sum, item) => sum + item.total_price, 0);

  return (
    <div className="space-y-4">
      <TableHeader
        totalAmount={totalAmount}
        formatNumber={formatNumber}
        onAddItem={addNewItem}
      />

      <Table>
        <ItemsTableHeader />
        <TableBody>
          {items.map((item) => (
            <ItemRow
              key={item.id}
              item={item}
              updateItem={updateItem}
              removeItem={removeItem}
              itemTypes={itemTypes}
              formatNumber={formatNumber}
              onAddNewType={handleTypeDialogOpen}
            />
          ))}
        </TableBody>
      </Table>

      <NewTypeDialog
        isOpen={isNewTypeDialogOpen}
        onOpenChange={setIsNewTypeDialogOpen}
        selectedItemId={selectedItemId}
        updateItem={updateItem}
      />
    </div>
  );
}