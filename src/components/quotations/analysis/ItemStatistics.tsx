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

  const { data: statistics, isLoading } = useQuery({
    queryKey: ['itemStatistics', searchTerm],
    queryFn: async () => {
      let query = supabase
        .from('item_statistics')
        .select('*');

      if (searchTerm) {
        query = query.or(`item_name.ilike.%${searchTerm}%,type_name.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as ItemStatistic[];
    },
  });

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
    
    // Auto-size columns
    const colWidths = Object.keys(exportData[0] || {}).map(key => ({
      wch: Math.max(key.length, ...exportData.map(row => String(row[key]).length))
    }));
    ws['!cols'] = colWidths;

    XLSX.writeFile(wb, `item_statistics_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Input
          placeholder="Search by item or type name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-sm"
        />
        <Button variant="outline" onClick={handleExport}>
          <Download className="mr-2 h-4 w-4" />
          Export to Excel
        </Button>
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