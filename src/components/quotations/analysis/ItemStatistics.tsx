import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { StatisticsTable } from "./table/StatisticsTable";
import { useEffect, useState } from "react";
import { StatisticsFilters } from "./filters/StatisticsFilters";
import * as XLSX from 'xlsx';
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { BudgetType } from "@/types/quotation";
import { DataPagination } from "@/components/ui/data-pagination";

export function ItemStatistics() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTypeId, setSelectedTypeId] = useState("all");
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [selectedBudget, setSelectedBudget] = useState<"all" | BudgetType>("all");
  const [selectedRecipient, setSelectedRecipient] = useState("all");
  const [selectedCreator, setSelectedCreator] = useState("all");
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Check if user is admin
  useEffect(() => {
    const checkUserRole = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
        
        setIsAdmin(profile?.role === 'admin');
      }
    };
    checkUserRole();
  }, []);

  const { data: itemTypes } = useQuery({
    queryKey: ['itemTypes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('item_types')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data;
    },
    staleTime: 5 * 60 * 1000,  // Item types don't change often
  });

  const { data: recipients } = useQuery({
    queryKey: ['recipients'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('quotations')
        .select('recipient')
        .eq('status', 'invoiced')  // Only get recipients from invoiced quotations
        .not('recipient', 'eq', '')
        .order('recipient');
      
      if (error) throw error;
      const uniqueRecipients = [...new Set(data.map(q => q.recipient))];
      return uniqueRecipients;
    },
    staleTime: 5 * 60 * 1000,  // Item types don't change often
  });

  const { data: creators } = useQuery({
    queryKey: ['creators'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email, role');
      
      if (error) throw error;
      return data;
    },
    enabled: isAdmin,
  });

  const { data: statistics, isLoading, refetch } = useQuery({
    queryKey: ['itemStatistics', searchTerm, selectedTypeId, startDate, endDate, selectedBudget, selectedRecipient, selectedCreator],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      let query = supabase
        .from('item_statistics')
        .select('*')
        .eq('status', 'invoiced')  // Only get items from invoiced quotations
        .order('total_value_iqd', { ascending: false });

      if (searchTerm) {
        query = query.or(`item_name.ilike.%${searchTerm}%,type_name.ilike.%${searchTerm}%`);
      }

      if (selectedTypeId !== 'all') {
        query = query.eq('type_id', selectedTypeId);
      }

      if (startDate) {
        query = query.gte('created_at', startDate.toISOString());
      }

      if (endDate) {
        query = query.lte('created_at', endDate.toISOString());
      }

      if (selectedBudget !== 'all') {
        query = query.eq('budget_type', selectedBudget as BudgetType);
      }

      if (selectedRecipient !== 'all') {
        query = query.eq('recipient', selectedRecipient);
      }

      if (!isAdmin) {
        query = query.eq('created_by', user?.id);
      } else if (selectedCreator !== 'all') {
        query = query.eq('created_by', selectedCreator);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  // Set up real-time subscription for statistics updates
  useEffect(() => {
    // Create an array to store all channels
    const channels = [];

    // Subscribe to quotations changes
    const quotationsChannel = supabase
      .channel('quotations-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'quotations'
        },
        () => {
          refetch();
        }
      )
      .subscribe();
    
    channels.push(quotationsChannel);

    // Subscribe to quotation items changes
    const itemsChannel = supabase
      .channel('quotation-items-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'quotation_items'
        },
        () => {
          refetch();
        }
      )
      .subscribe();
    
    channels.push(itemsChannel);

    // Subscribe to exchange rates changes
    const ratesChannel = supabase
      .channel('exchange-rates-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'exchange_rates'
        },
        () => {
          refetch();
        }
      )
      .subscribe();
    
    channels.push(ratesChannel);

    return () => {
      // Clean up all channels on unmount
      channels.forEach(channel => {
        supabase.removeChannel(channel);
      });
    };
  }, [refetch]);

  const handleExport = () => {
    if (!statistics?.length) return;

    const exportData = statistics.map(stat => ({
      'Type': stat.type_name || 'N/A',
      'Item Name': stat.item_name,
      'Total Quantity': stat.total_quantity,
      'Total Value': `${stat.total_value} ${stat.currency_type?.toUpperCase()}`,
      'Total Value (IQD)': `${stat.total_value_iqd} IQD`,
      'Budget Type': stat.budget_type === 'ma' ? 'MA' : 'Korek',
      'Recipient': stat.recipient || 'N/A',
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Item Statistics');

    const colWidths = Object.keys(exportData[0] || {}).map(key => ({
      wch: Math.max(key.length, ...exportData.map(row => String(row[key]).length))
    }));
    ws['!cols'] = colWidths;

    XLSX.writeFile(wb, `item_statistics_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);

    toast({
      title: "Success",
      description: "Statistics exported successfully",
    });
  };

  const handleBudgetChange = (value: string) => {
    setSelectedBudget(value as "all" | BudgetType);
  };

  // Calculate pagination
  const totalPages = Math.ceil((statistics?.length || 0) / itemsPerPage);
  const paginatedStatistics = statistics?.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-4">
      <StatisticsFilters 
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedTypeId={selectedTypeId}
        onTypeChange={setSelectedTypeId}
        startDate={startDate}
        onStartDateChange={setStartDate}
        endDate={endDate}
        onEndDateChange={setEndDate}
        onExport={handleExport}
        itemTypes={itemTypes}
        selectedBudget={selectedBudget}
        onBudgetChange={handleBudgetChange}
        selectedRecipient={selectedRecipient}
        onRecipientChange={setSelectedRecipient}
        selectedCreator={selectedCreator}
        onCreatorChange={setSelectedCreator}
        creators={creators}
        isAdmin={isAdmin}
        recipients={recipients}
      />
      <StatisticsTable 
        statistics={paginatedStatistics} 
        isLoading={isLoading} 
      />
      {totalPages > 1 && (
        <div className="mt-4">
          <DataPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </div>
  );
}