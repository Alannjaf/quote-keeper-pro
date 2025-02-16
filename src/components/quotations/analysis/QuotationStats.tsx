
import { useQuotationStats } from "@/hooks/use-quotation-stats";
import { StatsCard } from "./StatsCard";
import { FilterBudgetType, FilterQuotationStatus } from "@/types/quotation";
import { DollarSign, FileText, CheckCircle, PercentSquare } from "lucide-react";
import { useRealtimeSubscription } from "@/hooks/use-realtime-subscription";

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

  // Use our reusable hook for real-time subscriptions
  useRealtimeSubscription(
    [
      { table: 'quotations' },
      { table: 'quotation_items' },
      { table: 'exchange_rates' }
    ],
    [refetch]
  );

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatsCard
        title="Total Profit"
        value={stats?.totalProfit ? stats.totalProfit.toLocaleString() : "0"}
        description="Net profit from invoiced quotations"
        isLoading={isLoading}
        valuePrefix="IQD"
        icon={DollarSign}
      />
      <StatsCard
        title="Total Quotations"
        value={stats?.totalQuotations?.toString()}
        description="Total number of quotations"
        isLoading={isLoading}
        icon={FileText}
      />
      <StatsCard
        title="Approved Quotations"
        value={stats?.approvedQuotations?.toString()}
        description="Number of approved quotations"
        isLoading={isLoading}
        icon={CheckCircle}
      />
      <StatsCard
        title="Conversion Rate"
        value={stats?.conversionRate?.toString()}
        description="Approved vs total quotations"
        isLoading={isLoading}
        valueSuffix="%"
        icon={PercentSquare}
      />
    </div>
  );
}
