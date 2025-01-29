import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { QuotationList } from "./QuotationList";

export function QuotationListContainer({ 
  filters,
  currentUserProfile,
  onDataChange,
}: { 
  filters: any;
  currentUserProfile?: { role: string } | null;
  onDataChange?: (data: any[]) => void;
}) {
  const { data: exchangeRate, refetch: refetchExchangeRate } = useQuery({
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

  const { data: quotations, isLoading, refetch: refetchQuotations } = useQuery({
    queryKey: ['quotations', filters, exchangeRate], // Add exchangeRate to queryKey
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
        query = query.eq('budget_type', filters.budgetType);
      }

      if (filters.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }

      if (filters.startDate) {
        query = query.gte('date', filters.startDate.toISOString());
      }

      if (filters.endDate) {
        query = query.lte('date', filters.endDate.toISOString());
      }

      if (filters.createdBy && filters.createdBy !== 'all') {
        query = query.eq('created_by', filters.createdBy);
      }

      query = query.order('created_at', { ascending: false });

      const { data, error } = await query;
      
      if (error) throw error;
      return data;
    },
    enabled: !!exchangeRate, // Only run this query when we have the exchange rate
  });

  // Call onDataChange whenever quotations data changes
  useEffect(() => {
    if (onDataChange && quotations) {
      onDataChange(quotations);
    }
  }, [quotations, onDataChange]);

  // Set up real-time subscription for quotations, quotation items, and exchange rates
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
          refetchQuotations();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'quotation_items'
        },
        () => {
          refetchQuotations();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'exchange_rates'
        },
        () => {
          refetchExchangeRate();
          refetchQuotations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetchQuotations, refetchExchangeRate]);

  return (
    <QuotationList 
      quotations={quotations}
      isLoading={isLoading}
      onDelete={refetchQuotations}
      exchangeRate={exchangeRate}
    />
  );
}