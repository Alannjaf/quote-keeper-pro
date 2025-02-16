import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AppLayout } from "@/components/layout/AppLayout";
import { supabase } from "@/integrations/supabase/client";
import { FilterBudgetType, FilterQuotationStatus } from "@/types/quotation";
import { useToast } from "@/hooks/use-toast";
import * as XLSX from 'xlsx';
import { format } from "date-fns";
import { QuotationHeader } from "@/components/quotations/header/QuotationHeader";
import { QuotationStatsSection } from "@/components/quotations/stats/QuotationStatsSection";
import { QuotationListSection } from "@/components/quotations/list/QuotationListSection";

interface Filters {
  projectName: string;
  budgetType: FilterBudgetType | null;
  status: FilterQuotationStatus | null;
  startDate?: Date;
  endDate?: Date;
  createdBy?: string | null;
}

export default function QuotationsIndex() {
  const { toast } = useToast();
  const [currentQuotations, setCurrentQuotations] = useState<any[]>([]);
  
  const [filters, setFilters] = useState<Filters>(() => {
    const savedFilters = sessionStorage.getItem('quotationFilters');
    if (savedFilters) {
      const parsed = JSON.parse(savedFilters);
      return {
        ...parsed,
        startDate: parsed.startDate ? new Date(parsed.startDate) : undefined,
        endDate: parsed.endDate ? new Date(parsed.endDate) : undefined,
      };
    }
    return {
      projectName: "",
      budgetType: null,
      status: null,
      startDate: undefined,
      endDate: undefined,
      createdBy: null,
    };
  });

  const { data: currentUserProfile } = useQuery({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      
      if (error) throw error;
      return data;
    },
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const { data: users } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email')
        .order('first_name');
      
      if (error) throw error;
      return data;
    },
    enabled: currentUserProfile?.role === 'admin',
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const handleExport = async () => {
    if (!currentQuotations?.length) return;

    const exportData = currentQuotations.map(q => ({
      'Project Name': q.project_name,
      'Recipient': q.recipient,
      'Created By': q.creator ? `${q.creator.first_name} ${q.creator.last_name}` : 'Unknown',
      'Created At': format(new Date(q.created_at), 'PPP'),
      'Date': format(new Date(q.date), 'PPP'),
      'Validity Date': format(new Date(q.validity_date), 'PPP'),
      'Status': q.status.charAt(0).toUpperCase() + q.status.slice(1),
      'Budget Type': q.budget_type === 'ma' ? 'MA' : 'Korek',
      'Currency': q.currency_type.toUpperCase(),
      'Vendor Cost': `${q.vendor_cost} ${q.vendor_currency_type.toUpperCase()}`,
      'Note': q.note || '',
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Quotations');
    
    const colWidths = Object.keys(exportData[0] || {}).map(key => ({
      wch: Math.max(key.length, ...exportData.map(row => String(row[key]).length))
    }));
    ws['!cols'] = colWidths;

    XLSX.writeFile(wb, `quotations_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);

    toast({
      title: "Success",
      description: "Quotations exported successfully",
    });
  };

  return (
    <AppLayout>
      <div className="min-h-screen gradient-bg overflow-x-hidden">
        <div className="container py-8 max-w-7xl mx-auto space-y-8 px-4 sm:px-6 lg:px-8">
          <QuotationHeader />
          <QuotationStatsSection filters={filters} />
          <QuotationListSection
            filters={filters}
            setFilters={setFilters}
            currentUserProfile={currentUserProfile}
            users={users}
            onDataChange={setCurrentQuotations}
            handleExport={handleExport}
          />
        </div>
      </div>
    </AppLayout>
  );
}
