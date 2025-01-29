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
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

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
              <TableHead>Status</TableHead>
              <TableHead>Vendor Cost</TableHead>
              <TableHead>Created At</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : quotations?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center">
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
                  <TableCell className="capitalize">{quotation.status}</TableCell>
                  <TableCell>${quotation.vendor_cost.toLocaleString()}</TableCell>
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