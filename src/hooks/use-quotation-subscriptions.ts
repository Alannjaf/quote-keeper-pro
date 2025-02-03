// src/hooks/use-quotation-subscriptions.ts
import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { debounce } from 'lodash';

type RefetchFunction = () => void;

export function useQuotationSubscriptions() {
  const queryClient = useQueryClient();
  const refetchTimeoutRef = useRef<NodeJS.Timeout>();

  // Create debounced refetch functions
  const debouncedRefetchAll = debounce(() => {
    // Clear any pending refetch
    if (refetchTimeoutRef.current) {
      clearTimeout(refetchTimeoutRef.current);
    }

    // Schedule a new refetch
    refetchTimeoutRef.current = setTimeout(() => {
      queryClient.invalidateQueries({ 
        queryKey: ['quotations'],
        exact: false 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['itemStatistics'],
        exact: true 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['quotationStats'],
        exact: true 
      });
    }, 1000);
  }, 1000, { maxWait: 2000 });

  useEffect(() => {
    console.log('Setting up quotation subscriptions');
    
    const channel = supabase
      .channel('quotations-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'quotations'
        },
        (payload) => {
          console.log('Quotation inserted:', payload);
          debouncedRefetchAll();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'quotations'
        },
        (payload) => {
          console.log('Quotation updated:', payload);
          debouncedRefetchAll();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'quotation_items'
        },
        (payload) => {
          console.log('Quotation item inserted:', payload);
          debouncedRefetchAll();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'quotation_items'
        },
        (payload) => {
          console.log('Quotation item updated:', payload);
          debouncedRefetchAll();
        }
      )
      .subscribe((status) => {
        console.log('Subscription status:', status);
      });

    return () => {
      console.log('Cleaning up quotation subscriptions');
      if (refetchTimeoutRef.current) {
        clearTimeout(refetchTimeoutRef.current);
      }
      supabase.removeChannel(channel);
    };
  }, []);
}
