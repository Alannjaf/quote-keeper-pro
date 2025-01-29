import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { QuotationStatusSelect } from "@/components/quotations/QuotationStatusSelect";
import { format } from "date-fns";
import { QuotationStatusBadge } from "@/components/quotations/QuotationStatusBadge";
import { QuotationActions } from "@/components/quotations/QuotationActions";

export default function ViewQuotation() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: quotation } = useQuery({
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

  const formatNumber = (num: number) => {
    return num.toLocaleString('en-US');
  };

  if (!quotation) {
    return null;
  }

  const totalAmount = quotation.items?.reduce((sum, item) => sum + item.total_price, 0) || 0;

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight">
            {quotation.project_name}
          </h1>
          <div className="flex items-center gap-4">
            <QuotationStatusSelect
              id={id!}
              currentStatus={quotation.status}
            />
            <QuotationActions
              id={id!}
              onDelete={() => navigate('/quotations')}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <h2 className="text-lg font-semibold mb-4">Quotation Details</h2>
            <dl className="space-y-2">
              <div>
                <dt className="text-sm text-muted-foreground">Date</dt>
                <dd>{format(new Date(quotation.date), 'PPP')}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Validity Date</dt>
                <dd>{format(new Date(quotation.validity_date), 'PPP')}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Budget Type</dt>
                <dd className="capitalize">{quotation.budget_type.replace('_', ' ')}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Status</dt>
                <dd><QuotationStatusBadge status={quotation.status} /></dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Currency</dt>
                <dd className="uppercase">{quotation.currency_type}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Total Amount</dt>
                <dd>{formatNumber(totalAmount)} {quotation.currency_type.toUpperCase()}</dd>
              </div>
            </dl>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-4">Vendor Information</h2>
            <dl className="space-y-2">
              <div>
                <dt className="text-sm text-muted-foreground">Vendor Name</dt>
                <dd>{quotation.vendor?.name || 'N/A'}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Vendor Cost</dt>
                <dd>
                  {formatNumber(quotation.vendor_cost)} {quotation.vendor_currency_type.toUpperCase()}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">To</dt>
                <dd>{quotation.recipient || 'N/A'}</dd>
              </div>
            </dl>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-4">Items</h2>
          <div className="border rounded-lg">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="px-4 py-2 text-left">Item Name</th>
                  <th className="px-4 py-2 text-left">Description</th>
                  <th className="px-4 py-2 text-right">Quantity</th>
                  <th className="px-4 py-2 text-right">Unit Price</th>
                  <th className="px-4 py-2 text-right">Total Price</th>
                </tr>
              </thead>
              <tbody>
                {quotation.items?.map((item) => (
                  <tr key={item.id} className="border-b last:border-0">
                    <td className="px-4 py-2">{item.name}</td>
                    <td className="px-4 py-2">{item.description}</td>
                    <td className="px-4 py-2 text-right">{item.quantity}</td>
                    <td className="px-4 py-2 text-right">
                      {formatNumber(item.unit_price)} {quotation.currency_type.toUpperCase()}
                    </td>
                    <td className="px-4 py-2 text-right">
                      {formatNumber(item.total_price)} {quotation.currency_type.toUpperCase()}
                    </td>
                  </tr>
                ))}
                <tr className="font-semibold">
                  <td colSpan={4} className="px-4 py-2 text-right">Total:</td>
                  <td className="px-4 py-2 text-right">
                    {formatNumber(totalAmount)} {quotation.currency_type.toUpperCase()}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
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