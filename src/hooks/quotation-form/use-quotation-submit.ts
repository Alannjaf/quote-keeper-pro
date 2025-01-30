import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { QuotationFormData } from "@/types/quotation";

interface UseQuotationSubmitProps {
  mode: "create" | "edit";
  id?: string;
  onSuccess?: () => void;
}

interface VendorResponse {
  id: string;
  error?: any;
}

async function handleVendor(vendorName: string): Promise<VendorResponse> {
  const { data: existingVendor } = await supabase
    .from('vendors')
    .select('id')
    .eq('name', vendorName)
    .maybeSingle();

  if (existingVendor) {
    return { id: existingVendor.id };
  }

  const { data: newVendor, error: vendorError } = await supabase
    .from('vendors')
    .insert({ 
      name: vendorName,
      created_by: (await supabase.auth.getUser()).data.user?.id 
    })
    .select('id')
    .single();

  if (vendorError) {
    return { id: '', error: vendorError };
  }

  return { id: newVendor.id };
}

async function createQuotationItems(quotationId: string, items: QuotationFormData['items']) {
  if (items.length === 0) return;

  const quotationItems = items.map(item => ({
    quotation_id: quotationId,
    name: item.name,
    description: item.description,
    quantity: item.quantity,
    type_id: item.type_id,
    unit_price: item.unit_price,
    price: item.price,
    total_price: item.total_price,
  }));

  const { error: itemsError } = await supabase
    .from('quotation_items')
    .insert(quotationItems);

  if (itemsError) throw itemsError;
}

export function useQuotationSubmit({ mode, id, onSuccess }: UseQuotationSubmitProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const handleSubmit = async (formData: QuotationFormData) => {
    setIsSubmitting(true);

    try {
      const { id: vendorId, error: vendorError } = await handleVendor(formData.vendorName);
      if (vendorError) throw vendorError;

      const quotationData = {
        project_name: formData.projectName,
        date: format(formData.date, 'yyyy-MM-dd'),
        validity_date: format(formData.validityDate, 'yyyy-MM-dd'),
        budget_type: formData.budgetType,
        recipient: formData.recipient,
        currency_type: formData.currencyType,
        vendor_id: vendorId,
        vendor_cost: formData.vendorCost,
        vendor_currency_type: formData.vendorCurrencyType,
        discount: formData.discount,
        note: formData.note,
      };

      if (mode === 'create') {
        const { data: quotation, error: quotationError } = await supabase
          .from('quotations')
          .insert({
            ...quotationData,
            created_by: (await supabase.auth.getUser()).data.user?.id,
            status: 'draft'
          })
          .select('id')
          .single();

        if (quotationError) throw quotationError;

        await createQuotationItems(quotation.id, formData.items);
        await queryClient.invalidateQueries({ queryKey: ['quotations'] });
        
        toast({
          title: "Success",
          description: "Quotation created successfully",
        });

        navigate(`/quotations/${quotation.id}`);
      } else if (mode === 'edit' && id) {
        const { error: quotationError } = await supabase
          .from('quotations')
          .update(quotationData)
          .eq('id', id);

        if (quotationError) throw quotationError;

        const { error: deleteError } = await supabase
          .from('quotation_items')
          .delete()
          .eq('quotation_id', id);

        if (deleteError) throw deleteError;

        await createQuotationItems(id, formData.items);

        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ['quotations'] }),
          queryClient.invalidateQueries({ queryKey: ['quotation', id] }),
          queryClient.invalidateQueries({ queryKey: ['dashboardStats'] })
        ]);

        toast({
          title: "Success",
          description: "Quotation updated successfully",
        });

        if (onSuccess) {
          onSuccess();
        }
        
        navigate(`/quotations/${id}`);
      }
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

  return {
    isSubmitting,
    handleSubmit,
  };
}