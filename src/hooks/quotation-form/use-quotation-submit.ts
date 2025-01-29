import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { QuotationFormState, QuotationFormMode } from "./types";

interface UseQuotationSubmitProps {
  mode: QuotationFormMode;
  id?: string;
  onSuccess?: () => void;
}

export function useQuotationSubmit({ mode, id, onSuccess }: UseQuotationSubmitProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const handleSubmit = async (formState: QuotationFormState) => {
    setIsSubmitting(true);

    try {
      let vendorId = null;
      if (formState.vendorName) {
        const { data: existingVendor } = await supabase
          .from('vendors')
          .select('id')
          .eq('name', formState.vendorName)
          .maybeSingle();

        if (existingVendor) {
          vendorId = existingVendor.id;
        } else {
          const { data: newVendor, error: vendorError } = await supabase
            .from('vendors')
            .insert({ 
              name: formState.vendorName,
              created_by: (await supabase.auth.getUser()).data.user?.id 
            })
            .select('id')
            .single();

          if (vendorError) throw vendorError;
          vendorId = newVendor.id;
        }
      }

      const quotationData = {
        project_name: formState.projectName,
        date: format(formState.date, 'yyyy-MM-dd'),
        validity_date: format(formState.validityDate, 'yyyy-MM-dd'),
        budget_type: formState.budgetType,
        recipient: formState.recipient,
        currency_type: formState.currencyType,
        vendor_id: vendorId,
        vendor_cost: formState.vendorCost,
        vendor_currency_type: formState.vendorCurrencyType,
        discount: formState.discount,
        note: formState.note,
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

        if (formState.items.length > 0) {
          const quotationItems = formState.items.map(item => ({
            quotation_id: quotation.id,
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

        if (formState.items.length > 0) {
          const quotationItems = formState.items.map(item => ({
            quotation_id: id,
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