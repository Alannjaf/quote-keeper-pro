import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/layout/AppLayout";
import { QuotationForm } from "@/components/quotations/form/QuotationForm";

export default function NewQuotation() {
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

  const { data: vendors } = useQuery({
    queryKey: ['vendors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vendors')
        .select('*');
      if (error) throw error;
      return data;
    },
  });

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold tracking-tight mb-8">
          Create New Quotation
        </h1>
        <QuotationForm
          mode="create"
          vendors={vendors}
          itemTypes={itemTypes}
        />
      </div>
    </AppLayout>
  );
}