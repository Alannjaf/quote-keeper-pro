import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { QuotationStats } from "@/components/quotations/analysis/QuotationStats";
import { ItemStatistics } from "@/components/quotations/analysis/ItemStatistics";
import { FilterBudgetType, FilterQuotationStatus } from "@/types/quotation";
import { useToast } from "@/hooks/use-toast";
import { QuotationListContainer } from "@/components/quotations/list/QuotationListContainer";
import { FilterSection } from "@/components/quotations/filters/FilterSection";
import * as XLSX from 'xlsx';
import { format } from "date-fns";

interface Filters {
  projectName: string;
  budgetType: FilterBudgetType | null;
  status: FilterQuotationStatus | null;
  startDate?: Date;
  endDate?: Date;
  createdBy?: string | null;
}

export default function QuotationsIndex() {
  const navigate = useNavigate();
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
      <div className="min-h-screen gradient-bg">
        <div className="container py-8 max-w-7xl mx-auto space-y-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold tracking-tight gradient-text">
                Quotations
              </h1>
              <p className="text-muted-foreground mt-2">
                Manage your quotations here
              </p>
            </div>
            <Button 
              onClick={() => navigate('/quotations/new')}
              className="glass-card hover-card"
            >
              Create New Quotation
            </Button>
          </div>

          <div className="glass-card p-6 rounded-lg">
            <QuotationStats filters={filters} />
          </div>

          <div className="space-y-8">
            <div className="glass-card p-6 rounded-lg">
              <h2 className="text-2xl font-semibold mb-4 gradient-text">
                Item Statistics
              </h2>
              <ItemStatistics />
            </div>

            <div className="glass-card p-6 rounded-lg">
              <h2 className="text-2xl font-semibold mb-4 gradient-text">
                Quotations List
              </h2>
              <FilterSection 
                projectName={filters.projectName}
                onProjectNameChange={(value) => setFilters(prev => ({ ...prev, projectName: value }))}
                budgetType={filters.budgetType}
                onBudgetTypeChange={(value) => setFilters(prev => ({ ...prev, budgetType: value as FilterBudgetType }))}
                status={filters.status}
                onStatusChange={(value) => setFilters(prev => ({ ...prev, status: value as FilterQuotationStatus }))}
                startDate={filters.startDate}
                onStartDateChange={(date) => setFilters(prev => ({ ...prev, startDate: date }))}
                endDate={filters.endDate}
                onEndDateChange={(date) => setFilters(prev => ({ ...prev, endDate: date }))}
                onExport={handleExport}
                createdBy={filters.createdBy || null}
                onCreatedByChange={(value) => setFilters(prev => ({ ...prev, createdBy: value }))}
                users={users}
                isAdmin={currentUserProfile?.role === 'admin'}
              />

              <QuotationListContainer 
                filters={filters}
                currentUserProfile={currentUserProfile}
                onDataChange={setCurrentQuotations}
              />
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}