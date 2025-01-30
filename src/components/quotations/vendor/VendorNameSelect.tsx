import { useState } from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { PlusCircle } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

interface VendorNameSelectProps {
  vendorName: string;
  setVendorName: (value: string) => void;
}

export function VendorNameSelect({
  vendorName,
  setVendorName,
}: VendorNameSelectProps) {
  const [open, setOpen] = useState(false);
  const [newVendorName, setNewVendorName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: vendors } = useQuery({
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

  const handleCreateVendor = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    if (!newVendorName.trim()) {
      toast({
        title: "Error",
        description: "Vendor name cannot be empty",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    try {
      const { data: newVendor, error } = await supabase
        .from('vendors')
        .insert({ name: newVendorName })
        .select()
        .single();

      if (error) throw error;

      // Refetch vendors after creating a new one
      await queryClient.invalidateQueries({ queryKey: ['vendors'] });

      // Set the new vendor as the selected vendor
      if (newVendor?.name) {
        setVendorName(newVendor.name);
      }
      
      setNewVendorName("");
      setOpen(false);

      toast({
        title: "Success",
        description: "Vendor created successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="vendor">Vendor</Label>
      <div className="flex gap-2">
        <Select value={vendorName} onValueChange={setVendorName}>
          <SelectTrigger>
            <SelectValue placeholder="Select vendor..." />
          </SelectTrigger>
          <SelectContent>
            {vendors?.map((vendor) => (
              vendor.name && (  // Only render SelectItem if vendor.name exists and is not empty
                <SelectItem key={`vendor-${vendor.id}`} value={vendor.name}>
                  {vendor.name}
                </SelectItem>
              )
            ))}
          </SelectContent>
        </Select>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="icon">
              <PlusCircle className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Vendor</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateVendor} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newVendorName">Vendor Name</Label>
                <Input
                  id="newVendorName"
                  value={newVendorName}
                  onChange={(e) => setNewVendorName(e.target.value)}
                  placeholder="Enter vendor name"
                />
              </div>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Vendor"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}