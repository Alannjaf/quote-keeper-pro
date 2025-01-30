import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useRealtimeSubscription(
  refetchQuotations: () => Promise<void>,
  refetchExchangeRate: () => Promise<void>
) {
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
          await refetchQuotations();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'quotation_items'
        },
        async () => {
          await refetchQuotations();
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
          await refetchExchangeRate();
          await refetchQuotations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetchQuotations, refetchExchangeRate]);
}