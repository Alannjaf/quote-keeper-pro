import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

type QuotationStatus = "draft" | "pending" | "rejected" | "approved" | "invoiced";

interface QuotationStatusSelectProps {
  id: string;
  currentStatus: QuotationStatus;
  onStatusChange?: (newStatus: QuotationStatus) => void;
}

export function QuotationStatusSelect({ 
  id, 
  currentStatus,
  onStatusChange 
}: QuotationStatusSelectProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleStatusChange = async (newStatus: QuotationStatus) => {
    try {
      const { error } = await supabase
        .from('quotations')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;

      onStatusChange?.(newStatus);

      // Invalidate relevant queries to trigger refetch
      queryClient.invalidateQueries({ queryKey: ['quotation', id] });
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });

      toast({
        title: "Success",
        description: "Status updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <Select value={currentStatus} onValueChange={handleStatusChange}>
      <SelectTrigger className="w-[130px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="draft">Draft</SelectItem>
        <SelectItem value="pending">Pending</SelectItem>
        <SelectItem value="approved">Approved</SelectItem>
        <SelectItem value="rejected">Rejected</SelectItem>
        <SelectItem value="invoiced">Invoiced</SelectItem>
      </SelectContent>
    </Select>
  );
}