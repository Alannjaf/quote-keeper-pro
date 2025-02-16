
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useQuotationCount(filters: any) {
  return useQuery({
    queryKey: ['quotationsCount', filters],
    queryFn: async () => {
      let query = supabase
        .from('quotations')
        .select('*', { count: 'exact', head: true });

      if (filters.projectName) {
        query = query.ilike('project_name', `%${filters.projectName}%`);
      }

      if (filters.budgetType && filters.budgetType !== 'all') {
        query = query.eq('budget_type', filters.budgetType);
      }

      if (filters.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }

      if (filters.startDate) {
        query = query.gte('date', filters.startDate.toISOString());
      }

      if (filters.endDate) {
        query = query.lte('date', filters.endDate.toISOString());
      }

      if (filters.createdBy && filters.createdBy !== 'all') {
        query = query.eq('created_by', filters.createdBy);
      }

      const { count, error } = await query;
      if (error) throw error;
      return count || 0;
    },
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
