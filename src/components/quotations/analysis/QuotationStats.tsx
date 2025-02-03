import { useEffect } from "react";
import { useQuotationStats } from "@/hooks/use-quotation-stats";
import { StatsCard } from "./StatsCard";
import { supabase } from "@/integrations/supabase/client";
import { useQuotationSubscriptions } from '@/hooks/use-quotation-subscriptions';
import { FilterBudgetType, FilterQuotationStatus } from "@/types/quotation";
import { DollarSign, FileText, CheckCircle, PercentSquare } from "lucide-react";

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
  // Use only the centralized subscription
  useQuotationSubscriptions();
  
  const { data: stats, isLoading } = useQuotationStats(filters);

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