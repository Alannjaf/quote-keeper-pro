import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

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

  const handleTypeSelect = (itemId: string, value: string) => {
    if (value === "add_new") {
      setSelectedItemId(itemId);
      setIsNewTypeDialogOpen(true);
    } else {
      updateItem(itemId, 'type_id', value);
    }
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
        <TableHeader>
          <TableRow className="[&>th]:px-1">
            <TableHead className="w-[15%]">Item Name</TableHead>
            <TableHead className="w-[20%]">Description</TableHead>
            <TableHead className="w-[8%]">Quantity</TableHead>
            <TableHead className="w-[20%]">Type</TableHead>
            <TableHead className="w-[15%]">Unit Price</TableHead>
            <TableHead className="w-[10%]">Total Price</TableHead>
            <TableHead className="w-[2%]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id} className="[&>td]:px-1">
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
                  onValueChange={(value) => handleTypeSelect(item.id, value)}
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