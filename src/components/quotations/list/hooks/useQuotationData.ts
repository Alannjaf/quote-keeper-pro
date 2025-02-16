
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useQuotationData(filters: any, currentPage: number, exchangeRate: number) {
  return useQuery({
    queryKey: ['quotations', filters, exchangeRate, currentPage],
    queryFn: async () => {
      let query = supabase
        .from('quotations')
        .select(`
          *,
          quotation_items (*),
          creator:profiles (
            first_name,
            last_name,
            email
          )
        `);

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

      const from = (currentPage - 1) * 10;
      const to = from + 9;
      
      query = query
        .order('created_at', { ascending: false })
        .range(from, to);

      const { data, error } = await query;
      
      if (error) throw error;
      return data;
    },
    enabled: !!exchangeRate,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
