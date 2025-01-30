import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { QuotationList } from "./QuotationList";
import { useQuotationData } from "./hooks/useQuotationData";
import { useQuotationCount } from "./hooks/useQuotationCount";
import { useRealtimeSubscription } from "./hooks/useRealtimeSubscription";

const ITEMS_PER_PAGE = 10;

export function QuotationListContainer({ 
  filters,
  currentUserProfile,
  onDataChange,
}: { 
  filters: any;
  currentUserProfile?: { role: string } | null;
  onDataChange?: (data: any[]) => void;
}) {
  const [currentPage, setCurrentPage] = useState(1);

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

  const { 
    data: quotations, 
    isLoading, 
    refetch: refetchQuotations 
  } = useQuotationData(filters, currentPage, exchangeRate);

  const { data: totalCount, refetch: refetchCount } = useQuotationCount(filters);

  const totalPages = Math.ceil((totalCount || 0) / ITEMS_PER_PAGE);

  // Set up real-time subscriptions
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
        async () => {
          await Promise.all([
            refetchQuotations(),
            refetchCount()
          ]);
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'exchange_rates'
        },
        async () => {
          await Promise.all([
            refetchExchangeRate(),
            refetchQuotations()
          ]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetchQuotations, refetchExchangeRate, refetchCount]);

  // Call onDataChange whenever quotations data changes
  useEffect(() => {
    if (onDataChange && quotations) {
      onDataChange(quotations);
    }
  }, [quotations, onDataChange]);

  return (
    <QuotationList 
      quotations={quotations}
      isLoading={isLoading}
      onDelete={refetchQuotations}
      exchangeRate={exchangeRate}
      currentPage={currentPage}
      totalPages={totalPages}
      onPageChange={setCurrentPage}
    />
  );
}