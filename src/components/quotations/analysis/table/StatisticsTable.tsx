import { useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from "@/components/ui/table";
import { formatNumber } from "@/lib/format";
import { Database } from "@/integrations/supabase/types";
import { Loader2 } from "lucide-react";

type ItemStatisticsRow = Database['public']['Views']['item_statistics']['Row'];

interface StatisticsTableProps {
  statistics?: ItemStatisticsRow[];
  isLoading: boolean;
}

export function StatisticsTable({ statistics, isLoading }: StatisticsTableProps) {
  const navigate = useNavigate();

  const totalQuantity = statistics?.reduce((sum, stat) => sum + (stat.total_quantity || 0), 0) || 0;

  return (
    <div className="rounded-lg border border-border/50 bg-background/50 backdrop-blur-xl overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="font-semibold">Type</TableHead>
            <TableHead className="font-semibold">Item Name</TableHead>
            <TableHead className="font-semibold">Total Quantity</TableHead>
            <TableHead className="font-semibold">Total Value</TableHead>
            <TableHead className="font-semibold">Total Value (IQD)</TableHead>
            <TableHead className="font-semibold">Budget Type</TableHead>
            <TableHead className="font-semibold">Recipient</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center">
                <div className="flex items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              </TableCell>
            </TableRow>
          ) : !statistics?.length ? (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                No results found
              </TableCell>
            </TableRow>
          ) : (
            statistics.map((stat, index) => (
              <TableRow 
                key={index}
                className="group cursor-pointer transition-colors hover:bg-muted/50"
                onClick={() => navigate(`/quotations/${stat.quotation_id}`)}
              >
                <TableCell className="font-medium">{stat.type_name || 'N/A'}</TableCell>
                <TableCell>{stat.item_name}</TableCell>
                <TableCell>{formatNumber(stat.total_quantity)}</TableCell>
                <TableCell>
                  {formatNumber(stat.total_value)} {stat.currency_type?.toUpperCase()}
                </TableCell>
                <TableCell className="font-medium">
                  {formatNumber(stat.total_value_iqd)} IQD
                </TableCell>
                <TableCell>
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-spotify-purple/10 to-spotify-pink/10">
                    {stat.budget_type === 'ma' ? 'MA' : 'Korek'}
                  </span>
                </TableCell>
                <TableCell>{stat.recipient || 'N/A'}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
        {statistics && statistics.length > 0 && (
          <TableFooter>
            <TableRow>
              <TableCell colSpan={2} className="text-right font-medium">Total Quantity:</TableCell>
              <TableCell className="font-medium">{formatNumber(totalQuantity)}</TableCell>
              <TableCell colSpan={4}></TableCell>
            </TableRow>
          </TableFooter>
        )}
      </Table>
    </div>
  );
}