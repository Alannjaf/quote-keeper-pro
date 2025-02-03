import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { QuotationList } from "./QuotationList";
import { useQuotationData } from "./hooks/useQuotationData";
import { useQuotationCount } from "./hooks/useQuotationCount";
import { debounce } from 'lodash';

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

  useEffect(() => {
    const channel = supabase
      .channel('quotation-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',  // Be specific about events
          schema: 'public',
          table: 'quotations'
        },
        () => {
          // Use debounce to prevent rapid refetches
          debounce(() => refetchQuotations(), 1000);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'quotations'
        },
        () => {
          debounce(() => refetchQuotations(), 1000);
        }
      )
      .subscribe();
  
    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetchQuotations]);

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