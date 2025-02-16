
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { QueryObserverResult, RefetchOptions } from "@tanstack/react-query";

type RefetchFunction = (options?: RefetchOptions | undefined) => Promise<QueryObserverResult<any, Error>>;

interface RealtimeConfig {
  table: string;
  schema?: string;
  filter?: string;
  filterValue?: string;
}

export function useRealtimeSubscription(
  configs: RealtimeConfig[],
  refetchFunctions: RefetchFunction[]
) {
  useEffect(() => {
    const channel = supabase.channel('schema-db-changes');

    // Add subscriptions for each table
    configs.forEach((config) => {
      channel.on(
        'postgres_changes',
        {
          event: '*',
          schema: config.schema || 'public',
          table: config.table,
          ...(config.filter && config.filterValue ? {
            filter: `${config.filter}=eq.${config.filterValue}`
          } : {})
        },
        async () => {
          // Refetch all related data when any change occurs
          await Promise.all(refetchFunctions.map(refetch => refetch()));
        }
      );
    });

    // Subscribe to the channel
    channel.subscribe();

    // Cleanup
    return () => {
      supabase.removeChannel(channel);
    };
  }, [configs, refetchFunctions]);
}
