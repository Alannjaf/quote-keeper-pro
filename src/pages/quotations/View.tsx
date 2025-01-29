import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { QuotationStatusSelect } from "@/components/quotations/QuotationStatusSelect";
import { QuotationActions } from "@/components/quotations/QuotationActions";
import { QuotationPDF } from "@/components/quotations/QuotationPDF";
import { QuotationDetails } from "@/components/quotations/view/QuotationDetails";
import { QuotationItemsTable } from "@/components/quotations/view/QuotationItemsTable";
import { useEffect } from "react";

export default function ViewQuotation() {
  const { id } = useParams();
  const navigate = useNavigate();

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

  // Set up real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'quotations',
          filter: `id=eq.${id}`
        },
        () => {
          refetchQuotation();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'quotation_items',
          filter: `quotation_id=eq.${id}`
        },
        () => {
          refetchQuotation();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id, refetchQuotation]);

  const formatNumber = (num: number) => {
    return num.toLocaleString('en-US');
  };

  if (!quotation) {
    return null;
  }

  const subtotal = quotation.items?.reduce((sum, item) => sum + item.total_price, 0) || 0;
  const totalAmount = subtotal - quotation.discount;

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight">
            {quotation.project_name}
          </h1>
          <div className="flex items-center gap-4">
            <QuotationPDF quotationId={id!} />
            <QuotationStatusSelect
              id={id!}
              currentStatus={quotation.status}
              onStatusChange={() => refetchQuotation()}
            />
            <QuotationActions
              id={id!}
              onDelete={() => navigate('/quotations')}
            />
          </div>
        </div>

        <QuotationDetails
          quotation={quotation}
          formatNumber={formatNumber}
          subtotal={subtotal}
          totalAmount={totalAmount}
        />

        <div>
          <h2 className="text-lg font-semibold mb-4">Items</h2>
          <QuotationItemsTable
            items={quotation.items}
            formatNumber={formatNumber}
            currencyType={quotation.currency_type}
            subtotal={subtotal}
            discount={quotation.discount}
            totalAmount={totalAmount}
          />
        </div>

        <div className="mt-8 flex gap-4">
          <Button
            variant="outline"
            onClick={() => navigate('/quotations')}
          >
            Back to List
          </Button>
          <Button
            onClick={() => navigate(`/quotations/${id}/edit`)}
          >
            Edit Quotation
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}