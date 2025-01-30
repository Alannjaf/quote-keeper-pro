import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { StatisticsTable } from "./table/StatisticsTable";
import { useEffect } from "react";

export function ItemStatistics() {
  const { data: statistics, isLoading, refetch } = useQuery({
    queryKey: ['itemStatistics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('item_statistics')
        .select('*')
        .order('total_value_iqd', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  // Set up real-time subscription for statistics updates
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
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'quotation_items'
        },
        () => {
          refetch();
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
          refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetch]);

  return (
    <StatisticsTable 
      statistics={statistics} 
      isLoading={isLoading} 
    />
  );
}