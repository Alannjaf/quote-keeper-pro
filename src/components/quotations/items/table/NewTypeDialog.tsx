import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

interface NewTypeDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedItemId: string | null;
  updateItem: (id: string, field: string, value: any) => void;
}

export function NewTypeDialog({
  isOpen,
  onOpenChange,
  selectedItemId,
  updateItem,
}: NewTypeDialogProps) {
  const { toast } = useToast();
  const [newTypeName, setNewTypeName] = useState("");
  const queryClient = useQueryClient();

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
        
        // Invalidate the itemTypes query to trigger a refetch
        await queryClient.invalidateQueries({ queryKey: ['itemTypes'] });

        toast({
          title: "Success",
          description: `Added new type: ${newTypeName}`,
        });
        setNewTypeName("");
        onOpenChange(false);
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
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
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
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleAddNewType}>Add Type</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}