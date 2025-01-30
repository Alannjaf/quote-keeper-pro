import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import * as XLSX from 'xlsx';
import { format } from "date-fns";
import { formatNumber } from "@/lib/format";
import { StatisticsFilters } from "./filters/StatisticsFilters";
import { StatisticsTable } from "./table/StatisticsTable";
import { Database } from "@/integrations/supabase/types";
import { BudgetType } from "@/types/quotation";

type ItemStatisticsRow = Database['public']['Views']['item_statistics']['Row'];

export function ItemStatistics() {
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [selectedTypeId, setSelectedTypeId] = useState<string>("all");
  const [selectedBudget, setSelectedBudget] = useState<string>("all");
  const [selectedRecipient, setSelectedRecipient] = useState<string>("all");

  const { data: itemTypes } = useQuery({
    queryKey: ['itemTypes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('item_types')
        .select('id, name')
        .order('name');
      
      if (error) throw error;
      return data;
    },
  });

  const { data: recipients } = useQuery({
    queryKey: ['recipients'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('quotations')
        .select('recipient')
        .not('recipient', 'eq', '')
        .order('recipient');
      
      if (error) throw error;
      // Remove duplicates and null values
      const uniqueRecipients = [...new Set(data.map(q => q.recipient))].filter(Boolean);
      return uniqueRecipients;
    },
  });

  const { data: statistics, isLoading } = useQuery({
    queryKey: ['itemStatistics', searchTerm, startDate, endDate, selectedTypeId, selectedBudget, selectedRecipient],
    queryFn: async () => {
      let query = supabase
        .from('item_statistics')
        .select('*');

      if (searchTerm) {
        query = query.or(`item_name.ilike.%${searchTerm}%,type_name.ilike.%${searchTerm}%`);
      }

      if (startDate) {
        query = query.gte('created_at', startDate.toISOString());
      }

      if (endDate) {
        query = query.lte('created_at', endDate.toISOString());
      }

      if (selectedTypeId && selectedTypeId !== 'all') {
        query = query.eq('type_id', selectedTypeId);
      }

      if (selectedBudget && selectedBudget !== 'all') {
        query = query.eq('budget_type', selectedBudget as BudgetType);
      }

      if (selectedRecipient && selectedRecipient !== 'all') {
        query = query.eq('recipient', selectedRecipient);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as ItemStatisticsRow[];
    },
  });

  const totalQuantity = statistics?.reduce((sum, stat) => sum + Number(stat.total_quantity), 0) || 0;

  const handleExport = () => {
    if (!statistics) return;

    const exportData = statistics.map(stat => ({
      'Type': stat.type_name || 'N/A',
      'Item Name': stat.item_name || 'N/A',
      'Total Quantity': stat.total_quantity,
      'Total Value': `${formatNumber(stat.total_value)} ${stat.currency_type?.toUpperCase()}`,
      'Total Value (IQD)': formatNumber(stat.total_value_iqd),
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
  };

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
        onBudgetChange={setSelectedBudget}
        selectedRecipient={selectedRecipient}
        onRecipientChange={setSelectedRecipient}
        recipients={recipients}
      />

      <div className="bg-muted/50 p-4 rounded-lg mb-4">
        <div className="text-lg font-semibold">
          Total Quantity: {formatNumber(totalQuantity)}
        </div>
      </div>

      <StatisticsTable 
        statistics={statistics}
        isLoading={isLoading}
      />
    </div>
  );
}