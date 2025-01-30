import { useState } from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";

interface VendorNameSelectProps {
  vendorName: string;
  setVendorName: (value: string) => void;
  vendors?: Array<{ id: string; name: string }>;
}

export function VendorNameSelect({
  vendorName,
  setVendorName,
}: VendorNameSelectProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newVendorName, setNewVendorName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: vendors = [] } = useQuery({
    queryKey: ['vendors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vendors')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data;
    },
  });

  const handleCreateVendor = async () => {
    if (!newVendorName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a vendor name",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);
    try {
      const { data: newVendor, error } = await supabase
        .from('vendors')
        .insert({ 
          name: newVendorName.trim(),
          created_by: (await supabase.auth.getUser()).data.user?.id 
        })
        .select('name')
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Vendor created successfully",
      });

      // Invalidate and refetch vendors query
      await queryClient.invalidateQueries({ queryKey: ['vendors'] });

      setVendorName(newVendor.name);
      setIsDialogOpen(false);
      setNewVendorName("");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

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
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                variant="ghost" 
                className="w-full justify-start pl-8 gap-2"
                type="button"
              >
                <Plus className="h-4 w-4" />
                Create new vendor
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Vendor</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="newVendorName">Vendor Name</Label>
                  <Input
                    id="newVendorName"
                    value={newVendorName}
                    onChange={(e) => setNewVendorName(e.target.value)}
                    placeholder="Enter vendor name..."
                  />
                </div>
                <Button 
                  onClick={handleCreateVendor} 
                  disabled={isCreating}
                  className="w-full"
                >
                  {isCreating ? "Creating..." : "Create Vendor"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </SelectContent>
      </Select>
    </div>
  );
}