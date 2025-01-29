import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash } from "lucide-react";
import { QuotationItem } from "@/types/quotation";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  const [newType, setNewType] = useState("");
  const { toast } = useToast();

  const handleTypeChange = async (itemId: string, value: string) => {
    // Check if the value matches an existing type
    const existingType = itemTypes?.find(type => type.id === value || type.name === value);
    
    if (existingType) {
      updateItem(itemId, 'type_id', existingType.id);
      return;
    }

    // If it's a new type, create it in the database
    try {
      const { data: newTypeData, error } = await supabase
        .from('item_types')
        .insert({ name: value })
        .select('id, name')
        .single();

      if (error) throw error;

      if (newTypeData) {
        updateItem(itemId, 'type_id', newTypeData.id);
        toast({
          title: "Success",
          description: `Added new type: ${value}`,
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Items</h2>
        <Button type="button" onClick={addNewItem}>
          <Plus className="h-4 w-4 mr-2" />
          Add Item
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Item Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Unit Price</TableHead>
            <TableHead>Total Price</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id}>
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
                />
              </TableCell>
              <TableCell>
                <Input
                  type="number"
                  value={item.quantity}
                  onChange={(e) => updateItem(item.id, 'quantity', Number(e.target.value))}
                  required
                />
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Input
                      value={itemTypes?.find(type => type.id === item.type_id)?.name || ''}
                      onChange={(e) => {
                        setNewType(e.target.value);
                        handleTypeChange(item.id, e.target.value);
                      }}
                      placeholder="Select or type new..."
                    />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-[200px]">
                    {itemTypes?.map((type) => (
                      <DropdownMenuItem
                        key={type.id}
                        onClick={() => handleTypeChange(item.id, type.id)}
                      >
                        {type.name}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
              <TableCell>
                <Input
                  type="number"
                  value={item.unit_price}
                  onChange={(e) => updateItem(item.id, 'unit_price', Number(e.target.value))}
                  required
                />
              </TableCell>
              <TableCell>
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
    </div>
  );
}