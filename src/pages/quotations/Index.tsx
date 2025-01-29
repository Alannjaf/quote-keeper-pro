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

export default function QuotationsIndex() {
  const navigate = useNavigate();

  const { data: quotations, isLoading } = useQuery({
    queryKey: ['quotations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('quotations')
        .select(`
          *,
          quotation_items (*)
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
              <TableHead>Status</TableHead>
              <TableHead>Vendor Cost</TableHead>
              <TableHead>Total Items Value</TableHead>
              <TableHead>Created At</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : quotations?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  No quotations found
                </TableCell>
              </TableRow>
            ) : (
              quotations?.map((quotation) => (
                <TableRow 
                  key={quotation.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => navigate(`/quotations/${quotation.id}`)}
                >
                  <TableCell>{quotation.project_name}</TableCell>
                  <TableCell>{quotation.recipient}</TableCell>
                  <TableCell className="capitalize">{quotation.status}</TableCell>
                  <TableCell>
                    {formatNumber(quotation.vendor_cost)} {quotation.vendor_currency_type.toUpperCase()}
                  </TableCell>
                  <TableCell>
                    {formatNumber(calculateTotalPrice(quotation.quotation_items))} {quotation.currency_type.toUpperCase()}
                  </TableCell>
                  <TableCell>
                    {new Date(quotation.created_at).toLocaleDateString()}
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