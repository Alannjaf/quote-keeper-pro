import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ChartBar, TrendingUp, Users, FileText } from "lucide-react";
import { FilterBudgetType, FilterQuotationStatus } from "@/types/quotation";
import { Database } from "@/integrations/supabase/types";

interface QuotationStatsProps {
  filters: {
    projectName: string;
    budgetType: FilterBudgetType | null;
    status: FilterQuotationStatus | null;
    startDate?: Date;
    endDate?: Date;
  };
}

type QuotationAnalysis = Database['public']['Views']['quotation_analysis']['Row'];

export function QuotationStats({ filters }: QuotationStatsProps) {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['quotationStats', filters],
    queryFn: async () => {
      // First get the current user's profile to check role
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      // Build the base query
      let queryBuilder = supabase
        .from('quotation_analysis')
        .select<'*', QuotationAnalysis>('*');

      // Apply filters
      if (filters.projectName) {
        queryBuilder = queryBuilder.ilike('project_name', `%${filters.projectName}%`);
      }

      if (filters.budgetType && filters.budgetType !== 'all') {
        queryBuilder = queryBuilder.eq('budget_type', filters.budgetType);
      }

      if (filters.status && filters.status !== 'all') {
        queryBuilder = queryBuilder.eq('status', filters.status);
      }

      if (filters.startDate) {
        queryBuilder = queryBuilder.gte('date', filters.startDate.toISOString());
      }

      if (filters.endDate) {
        queryBuilder = queryBuilder.lte('date', filters.endDate.toISOString());
      }

      // For non-admin users, filter by their own quotations using id from the quotations table
      if (profile?.role !== 'admin') {
        const { data: userQuotations } = await supabase
          .from('quotations')
          .select('id')
          .eq('created_by', user.id);
        
        if (userQuotations) {
          const quotationIds = userQuotations.map(q => q.id);
          queryBuilder = queryBuilder.in('id', quotationIds);
        }
      }

      const { data, error } = await queryBuilder;
      
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