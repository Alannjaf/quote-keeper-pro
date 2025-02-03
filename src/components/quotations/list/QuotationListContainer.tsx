// src/components/quotations/list/QuotationListContainer.tsx
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { QuotationList } from "./QuotationList";
import { useQuotationData } from "./hooks/useQuotationData";
import { useQuotationCount } from "./hooks/useQuotationCount";
import { useQuotationSubscriptions } from '@/hooks/use-quotation-subscriptions';

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
  
  // Use the centralized subscription hook
  useQuotationSubscriptions();

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
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  const { 
    data: quotations, 
    isLoading,
  } = useQuotationData(filters, currentPage, exchangeRate);

  const { data: totalCount } = useQuotationCount(filters);

  const totalPages = Math.ceil((totalCount || 0) / ITEMS_PER_PAGE);

  useEffect(() => {
    if (onDataChange && quotations) {
      onDataChange(quotations);
    }
  }, [quotations, onDataChange]);

  return (
    <QuotationList 
      quotations={quotations}
      isLoading={isLoading}
      onDelete={() => {}}
      exchangeRate={exchangeRate}
      currentPage={currentPage}
      totalPages={totalPages}
      onPageChange={setCurrentPage}
    />
  );
}
