import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { FilterBudgetType, FilterQuotationStatus } from "@/types/quotation";
import { Database } from "@/integrations/supabase/types";

type QuotationAnalysis = Database['public']['Views']['quotation_analysis']['Row'];

interface StatsFilters {
  projectName: string;
  budgetType: FilterBudgetType | null;
  status: FilterQuotationStatus | null;
  startDate?: Date;
  endDate?: Date;
}

export function useQuotationStats(filters: StatsFilters) {
  return useQuery({
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

      // For non-admin users, filter by their own quotations
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
}