import { useEffect, useState } from "react";
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
import { QuotationStats } from "@/components/quotations/analysis/QuotationStats";
import { QuotationFilters } from "@/components/quotations/filters/QuotationFilters";
import { Database } from "@/integrations/supabase/types";
import { useToast } from "@/hooks/use-toast";
import { BudgetType, FilterBudgetType, QuotationStatus, FilterQuotationStatus } from "@/types/quotation";
import * as XLSX from 'xlsx';

type QuotationWithRelations = Database['public']['Tables']['quotations']['Row'] & {
  quotation_items: Database['public']['Tables']['quotation_items']['Row'][];
  creator?: {
    first_name: string | null;
    last_name: string | null;
    email: string | null;
  } | null;
};

interface Filters {
  projectName?: string;
  budgetType: FilterBudgetType | null;
  status: FilterQuotationStatus | null;
  startDate?: Date;
  endDate?: Date;
}

export default function QuotationsIndex() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [filters, setFilters] = useState<Filters>({
    budgetType: null,
    status: null
  });

  const { data: exchangeRate } = useQuery({
    queryKey: ['currentExchangeRate'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('exchange_rates')
        .select('rate')
        .order('date', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (error) throw error;
      return data?.rate || 1;
    },
  });

  const { data: quotations, isLoading, refetch } = useQuery({
    queryKey: ['quotations', filters],
    queryFn: async () => {
      let query = supabase
        .from('quotations')
        .select(`
          *,
          quotation_items (*),
          creator:profiles (
            first_name,
            last_name,
            email
          )
        `);

      if (filters.projectName) {
        query = query.ilike('project_name', `%${filters.projectName}%`);
      }

      if (filters.budgetType && filters.budgetType !== 'all') {
        query = query.eq('budget_type', filters.budgetType as BudgetType);
      }

      if (filters.status && filters.status !== 'all') {
        query = query.eq('status', filters.status as QuotationStatus);
      }

      if (filters.startDate) {
        query = query.gte('date', filters.startDate.toISOString());
      }

      if (filters.endDate) {
        query = query.lte('date', filters.endDate.toISOString());
      }

      query = query.order('created_at', { ascending: false });

      const { data, error } = await query;
      
      if (error) throw error;
      return data as QuotationWithRelations[];
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
          table: 'quotations'
        },
        () => {
          refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetch]);

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

  const handleExport = async () => {
    if (!quotations) return;

    const exportData = quotations.map(q => ({
      'Project Name': q.project_name,
      'Recipient': q.recipient,
      'Created By': q.creator ? `${q.creator.first_name} ${q.creator.last_name}` : 'Unknown',
      'Status': q.status,
      'Vendor Cost (IQD)': formatNumber(convertToIQD(q.vendor_cost, q.vendor_currency_type)),
      'Total Items Value': `${formatNumber(calculateTotalPrice(q.quotation_items))} ${q.currency_type.toUpperCase()}`,
      'Created At': new Date(q.created_at).toLocaleDateString(),
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Quotations');
    XLSX.writeFile(wb, 'quotations.xlsx');

    toast({
      title: "Success",
      description: "Quotations exported successfully",
    });
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

      <QuotationStats />

      <QuotationFilters 
        onFilterChange={setFilters}
        onExport={handleExport}
      />

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
                    {quotation.creator ? (
                      <span className="text-sm">
                        {quotation.creator.first_name} {quotation.creator.last_name}
                        <br />
                        <span className="text-muted-foreground">
                          {quotation.creator.email}
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
