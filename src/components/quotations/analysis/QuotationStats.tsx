import { useEffect } from "react";
import { useQuotationStats } from "@/hooks/use-quotation-stats";
import { StatsCard } from "./StatsCard";
import { supabase } from "@/integrations/supabase/client";
import { FilterBudgetType, FilterQuotationStatus } from "@/types/quotation";

interface QuotationStatsProps {
  filters: {
    projectName: string;
    budgetType: FilterBudgetType | null;
    status: FilterQuotationStatus | null;
    startDate?: Date;
    endDate?: Date;
  };
}

export function QuotationStats({ filters }: QuotationStatsProps) {
  const { data: stats, isLoading, refetch } = useQuotationStats(filters);

  // Set up real-time subscription for stats updates
  useEffect(() => {
    const channel = supabase
      .channel('quotation-stats-changes')
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
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatsCard
        title="Total Profit"
        value={stats?.totalProfit?.toString()}
        description="Net profit from invoiced quotations"
        isLoading={isLoading}
        valuePrefix="IQD"
      />
      <StatsCard
        title="Total Quotations"
        value={stats?.totalQuotations?.toString()}
        description="Total number of quotations"
        isLoading={isLoading}
      />
      <StatsCard
        title="Approved Quotations"
        value={stats?.approvedQuotations?.toString()}
        description="Number of approved quotations"
        isLoading={isLoading}
      />
      <StatsCard
        title="Conversion Rate"
        value={stats?.conversionRate?.toString()}
        description="Approved vs total quotations"
        isLoading={isLoading}
        valueSuffix="%"
      />
    </div>
  );
}