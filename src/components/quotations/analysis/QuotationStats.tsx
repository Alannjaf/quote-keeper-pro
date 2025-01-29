import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ChartBar, TrendingUp, Users, FileText } from "lucide-react";

export function QuotationStats() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['quotationStats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('quotation_analysis')
        .select('*');
      
      if (error) throw error;

      const totalProfit = data.reduce((sum, q) => sum + (q.profit_iqd || 0), 0);
      const totalQuotations = data.length;
      const approvedQuotations = data.filter(q => q.status === 'approved' || q.status === 'invoiced').length;
      const conversionRate = totalQuotations ? (approvedQuotations / totalQuotations) * 100 : 0;

      return {
        totalProfit,
        totalQuotations,
        approvedQuotations,
        conversionRate
      };
    }
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US').format(amount);
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
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {stat.title}
            </CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">
              {stat.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}