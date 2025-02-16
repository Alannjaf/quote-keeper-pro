
import { useQuery } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/layout/AppLayout";
import { QuotationForm } from "@/components/quotations/form/QuotationForm";
import { QuotationStatusSelect } from "@/components/quotations/QuotationStatusSelect";
import { useToast } from "@/hooks/use-toast";

export default function EditQuotation() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: quotation, isLoading, error } = useQuery({
    queryKey: ['quotation', id],
    queryFn: async () => {
      console.log('Fetching quotation with id:', id);
      const { data, error } = await supabase
        .from('quotations')
        .select(`
          *,
          quotation_items:quotation_items (
            id,
            name,
            description,
            quantity,
            type_id,
            unit_price,
            price,
            total_price
          ),
          vendor:vendors (*)
        `)
        .eq('id', id)
        .single();
      
      if (error) {
        console.error('Error fetching quotation:', error);
        throw error;
      }
      
      console.log('Raw quotation data:', data);
      console.log('Quotation items:', data?.quotation_items);
      return {
        ...data,
        items: data.quotation_items // Ensure items are assigned here
      };
    },
  });

  // Fetch item types for the form
  const { data: itemTypes } = useQuery({
    queryKey: ['itemTypes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('item_types')
        .select('*');
      if (error) throw error;
      return data;
    },
  });

  if (error) {
    toast({
      title: "Error",
      description: "Failed to load quotation data",
      variant: "destructive",
    });
    navigate('/quotations');
    return null;
  }

  // No need for additional formData transformation since items are already in the right format
  console.log('Form initial data:', quotation);

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight">
            Edit Quotation
          </h1>
          {quotation && (
            <QuotationStatusSelect
              id={id!}
              currentStatus={quotation.status}
            />
          )}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <p>Loading quotation data...</p>
          </div>
        ) : quotation ? (
          <QuotationForm
            mode="edit"
            id={id}
            initialData={quotation}
            itemTypes={itemTypes}
          />
        ) : null}
      </div>
    </AppLayout>
  );
}
