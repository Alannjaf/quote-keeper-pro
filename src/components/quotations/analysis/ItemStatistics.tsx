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
import { Card, CardContent } from "@/components/ui/card";
import { ChartBar } from "lucide-react";

type ItemStatisticsRow = Database['public']['Views']['item_statistics']['Row'];

export function ItemStatistics() {
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [selectedTypeId, setSelectedTypeId] = useState<string>("all");
  const [selectedBudget, setSelectedBudget] = useState<string>("all");
  const [selectedRecipient, setSelectedRecipient] = useState<string>("all");
  const [selectedCreator, setSelectedCreator] = useState<string>("all");

  // Get current user's profile to check role and id
  const { data: currentUserProfile, isLoading: isProfileLoading } = useQuery({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('profiles')
        .select('id, role')
        .eq('id', user.id)
        .single();
      
      if (error) throw error;
      return data;
    },
  });

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
    queryKey: ['recipients', currentUserProfile?.role, currentUserProfile?.id],
    queryFn: async () => {
      if (!currentUserProfile?.id) return [];

      let query = supabase
        .from('quotations')
        .select('recipient')
        .not('recipient', 'eq', '');

      // If not admin, only fetch recipients from user's quotations
      if (currentUserProfile?.role !== 'admin') {
        query = query.eq('created_by', currentUserProfile.id);
      }

      query = query.order('recipient');
      
      const { data, error } = await query;
      if (error) throw error;
      
      // Remove duplicates and null values
      const uniqueRecipients = [...new Set(data.map(q => q.recipient))].filter(Boolean);
      return uniqueRecipients;
    },
    enabled: !!currentUserProfile?.id,
  });

  const { data: creators } = useQuery({
    queryKey: ['creators'],
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

  const { data: statistics, isLoading: isStatsLoading } = useQuery({
    queryKey: ['itemStatistics', searchTerm, startDate, endDate, selectedTypeId, selectedBudget, selectedRecipient, selectedCreator, currentUserProfile?.id],
    queryFn: async () => {
      if (!currentUserProfile?.id) return [];

      let query = supabase
        .from('item_statistics')
        .select('*');

      // If not admin, only show user's statistics
      if (currentUserProfile?.role !== 'admin') {
        query = query.eq('created_by', currentUserProfile.id);
      }

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

      // Only apply creator filter if user is admin
      if (currentUserProfile?.role === 'admin' && selectedCreator && selectedCreator !== 'all') {
        query = query.eq('created_by', selectedCreator);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as ItemStatisticsRow[];
    },
    enabled: !!currentUserProfile?.id,
  });

  const totalQuantity = statistics?.reduce((sum, stat) => sum + Number(stat.total_quantity), 0) || 0;

  const handleExport = async () => {
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
    <div className="space-y-6">
      <Card className="glass-card overflow-hidden border-none shadow-lg">
        <div className="bg-gradient-to-r from-spotify-purple/10 via-spotify-orange/10 to-spotify-pink/10 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-full bg-gradient-to-br from-spotify-purple via-spotify-orange to-spotify-pink">
              <ChartBar className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-semibold gradient-text">
                Item Statistics
              </h3>
              <p className="text-muted-foreground">
                Analyze your items performance and trends
              </p>
            </div>
          </div>

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
            selectedCreator={selectedCreator}
            onCreatorChange={setSelectedCreator}
            creators={creators}
            isAdmin={currentUserProfile?.role === 'admin'}
          />
        </div>

        <CardContent className="p-6">
          <div className="mb-6">
            <Card className="glass-card border-none bg-gradient-to-br from-spotify-purple/5 via-spotify-orange/5 to-spotify-pink/5 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Total Quantity
                  </p>
                  <h4 className="text-2xl font-bold gradient-text">
                    {formatNumber(totalQuantity)}
                  </h4>
                </div>
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-spotify-purple via-spotify-orange to-spotify-pink flex items-center justify-center">
                  <ChartBar className="h-6 w-6 text-white" />
                </div>
              </div>
            </Card>
          </div>

          <StatisticsTable 
            statistics={statistics}
            isLoading={isProfileLoading || isStatsLoading}
          />
        </CardContent>
      </Card>
    </div>
  );
}
