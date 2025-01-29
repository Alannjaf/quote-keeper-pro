import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Download } from "lucide-react";
import * as XLSX from 'xlsx';
import { format } from "date-fns";
import { formatNumber } from "@/lib/format";
import { DateSelect } from "@/components/quotations/form/DateSelect";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ItemStatistic {
  type_id: string | null;
  type_name: string | null;
  item_name: string | null;
  total_quantity: number;
  total_value: number;
  currency_type: 'usd' | 'iqd';
  total_value_iqd: number;
}

export function ItemStatistics() {
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [selectedTypeId, setSelectedTypeId] = useState<string>("all");

  // Fetch item types for the filter
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

  const { data: statistics, isLoading } = useQuery({
    queryKey: ['itemStatistics', searchTerm, startDate, endDate, selectedTypeId],
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

      const { data, error } = await query;
      if (error) throw error;
      return data as ItemStatistic[];
    },
  });

  const totalQuantity = statistics?.reduce((sum, stat) => sum + Number(stat.total_quantity), 0) || 0;

  const handleExport = () => {
    if (!statistics) return;

    const exportData = statistics.map(stat => ({
      'Type': stat.type_name || 'N/A',
      'Item Name': stat.item_name || 'N/A',
      'Total Quantity': stat.total_quantity,
      'Total Value': `${formatNumber(stat.total_value)} ${stat.currency_type.toUpperCase()}`,
      'Total Value (IQD)': formatNumber(stat.total_value_iqd),
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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col sm:flex-row gap-4">
          <Input
            placeholder="Search by item or type name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-[300px]"
          />
          <Select
            value={selectedTypeId}
            onValueChange={setSelectedTypeId}
          >
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {itemTypes?.map((type) => (
                <SelectItem key={type.id} value={type.id}>
                  {type.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button variant="outline" onClick={handleExport}>
          <Download className="mr-2 h-4 w-4" />
          Export to Excel
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <DateSelect
          label="Start Date"
          date={startDate}
          onSelect={setStartDate}
        />
        <DateSelect
          label="End Date"
          date={endDate}
          onSelect={setEndDate}
        />
      </div>

      <div className="bg-muted/50 p-4 rounded-lg mb-4">
        <div className="text-lg font-semibold">
          Total Quantity: {formatNumber(totalQuantity)}
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Item Name</TableHead>
              <TableHead>Total Quantity</TableHead>
              <TableHead>Total Value</TableHead>
              <TableHead>Total Value (IQD)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : !statistics?.length ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  No statistics found
                </TableCell>
              </TableRow>
            ) : (
              statistics.map((stat, index) => (
                <TableRow key={index}>
                  <TableCell>{stat.type_name || 'N/A'}</TableCell>
                  <TableCell>{stat.item_name || 'N/A'}</TableCell>
                  <TableCell>{formatNumber(stat.total_quantity)}</TableCell>
                  <TableCell>
                    {formatNumber(stat.total_value)} {stat.currency_type.toUpperCase()}
                  </TableCell>
                  <TableCell>{formatNumber(stat.total_value_iqd)} IQD</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}