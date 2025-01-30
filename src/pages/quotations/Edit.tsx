import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/layout/AppLayout";
import { QuotationForm } from "@/components/quotations/form/QuotationForm";
import { QuotationStatusSelect } from "@/components/quotations/QuotationStatusSelect";

export default function EditQuotation() {
  const { id } = useParams();

  const { data: quotation, refetch: refetchQuotation } = useQuery({
    queryKey: ['quotation', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('quotations')
        .select(`
          *,
          vendor:vendors(name),
          items:quotation_items(*)
        `)
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    },
  });

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
              onStatusChange={(status) => {
                refetchQuotation();
              }}
            />
          )}
        </div>

        <QuotationForm
          mode="edit"
          id={id}
          initialData={quotation}
          itemTypes={itemTypes}
          onSuccess={refetchQuotation}
        />
      </div>
    </AppLayout>
  );
}