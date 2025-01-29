import { Table, TableBody } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { QuotationItem } from "@/types/quotation";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { ItemsTableHeader } from "./items/ItemsTableHeader";
import { ItemRow } from "./items/ItemRow";

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
  const [newTypeName, setNewTypeName] = useState("");
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const { toast } = useToast();

  const handleAddNewType = async () => {
    if (!newTypeName.trim() || !selectedItemId) return;

    try {
      const { data: newType, error } = await supabase
        .from('item_types')
        .insert({ name: newTypeName.trim() })
        .select('id, name')
        .single();

      if (error) throw error;

      if (newType) {
        updateItem(selectedItemId, 'type_id', newType.id);
        toast({
          title: "Success",
          description: `Added new type: ${newTypeName}`,
        });
        setNewTypeName("");
        setIsNewTypeDialogOpen(false);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleTypeDialogOpen = (itemId: string) => {
    setSelectedItemId(itemId);
    setIsNewTypeDialogOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Items</h2>
        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground">
            Total: {formatNumber(items.reduce((sum, item) => sum + item.total_price, 0))}
          </div>
          <Button type="button" onClick={addNewItem}>
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </Button>
        </div>
      </div>

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

      <Dialog open={isNewTypeDialogOpen} onOpenChange={setIsNewTypeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Type</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              value={newTypeName}
              onChange={(e) => setNewTypeName(e.target.value)}
              placeholder="Enter new type name"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewTypeDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddNewType}>Add Type</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}