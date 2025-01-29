import { useQuery } from "@tanstack/react-query";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { QuotationActions } from "@/components/quotations/QuotationActions";
import { QuotationStatusSelect } from "@/components/quotations/QuotationStatusSelect";

export default function QuotationsIndex() {
  const navigate = useNavigate();

  const { data: exchangeRate } = useQuery({
    queryKey: ['currentExchangeRate'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('exchange_rates')
        .select('rate')
        .order('date', { ascending: false })
        .limit(1)
        .single();
      
      if (error) throw error;
      return data?.rate || 1;
    },
  });

  const { data: quotations, isLoading, refetch } = useQuery({
    queryKey: ['quotations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('quotations')
        .select(`
          *,
          quotation_items (*),
          profiles:created_by (
            first_name,
            last_name,
            email
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const calculateTotalPrice = (items: any[]) => {
    return items?.reduce((sum, item) => sum + (item.total_price || 0), 0) || 0;
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString('en-US');
  };

  const convertToIQD = (amount: number, currency: string) => {
    if (!exchangeRate) return amount;
    return currency === 'usd' ? amount * exchangeRate : amount;
  };

  return (
    <AppLayout>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quotations</h1>
          <p className="text-muted-foreground">
            Manage your quotations here
          </p>
        </div>
        <Button onClick={() => navigate('/quotations/new')}>
          Create New Quotation
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Project Name</TableHead>
              <TableHead>To</TableHead>
              <TableHead>Created By</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Vendor Cost (IQD)</TableHead>
              <TableHead>Total Items Value</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : quotations?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center">
                  No quotations found
                </TableCell>
              </TableRow>
            ) : (
              quotations?.map((quotation) => (
                <TableRow 
                  key={quotation.id}
                  className="group"
                >
                  <TableCell 
                    className="cursor-pointer hover:underline"
                    onClick={() => navigate(`/quotations/${quotation.id}`)}
                  >
                    {quotation.project_name}
                  </TableCell>
                  <TableCell>{quotation.recipient}</TableCell>
                  <TableCell>
                    {quotation.profiles ? (
                      <span className="text-sm">
                        {quotation.profiles.first_name} {quotation.profiles.last_name}
                        <br />
                        <span className="text-muted-foreground">
                          {quotation.profiles.email}
                        </span>
                      </span>
                    ) : 'Unknown'}
                  </TableCell>
                  <TableCell>
                    <QuotationStatusSelect
                      id={quotation.id}
                      currentStatus={quotation.status}
                    />
                  </TableCell>
                  <TableCell>
                    {formatNumber(convertToIQD(quotation.vendor_cost, quotation.vendor_currency_type))} IQD
                  </TableCell>
                  <TableCell>
                    {formatNumber(calculateTotalPrice(quotation.quotation_items))} {quotation.currency_type.toUpperCase()}
                  </TableCell>
                  <TableCell>
                    {new Date(quotation.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <QuotationActions id={quotation.id} onDelete={refetch} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </AppLayout>
  );
}