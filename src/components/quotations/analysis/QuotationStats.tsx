import { ChartBar, TrendingUp, Users, FileText } from "lucide-react";
import { FilterBudgetType, FilterQuotationStatus } from "@/types/quotation";
import { useQuotationStats } from "@/hooks/use-quotation-stats";
import { StatsCard } from "./StatsCard";

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
  const { data: stats, isLoading } = useQuotationStats(filters);

  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const dashboardStats = [
    {
      title: "Total Quotations",
      value: isLoading ? "Loading..." : stats?.totalQuotations.toString(),
      icon: FileText,
      description: "Total number of quotations",
    },
    {
      title: "Approved Quotations",
      value: isLoading ? "Loading..." : stats?.approvedQuotations.toString(),
      icon: Users,
      description: "Number of approved quotations",
    },
    {
      title: "Total Profit (IQD)",
      value: isLoading ? "Loading..." : formatCurrency(stats?.totalProfit || 0),
      icon: TrendingUp,
      description: "Total profit across all quotations",
    },
    {
      title: "Conversion Rate",
      value: isLoading ? "Loading..." : `${stats?.conversionRate.toFixed(1)}%`,
      icon: ChartBar,
      description: "Quotation approval rate",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
      {dashboardStats.map((stat) => (
        <StatsCard
          key={stat.title}
          title={stat.title}
          value={stat.value || "0"}
          icon={stat.icon}
          description={stat.description}
        />
      ))}
    </div>
  );
}