import { useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatNumber } from "@/lib/format";
import { Database } from "@/integrations/supabase/types";

type ItemStatisticsRow = Database['public']['Views']['item_statistics']['Row'];

interface StatisticsTableProps {
  statistics?: ItemStatisticsRow[];
  isLoading: boolean;
}

export function StatisticsTable({ statistics, isLoading }: StatisticsTableProps) {
  const navigate = useNavigate();

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Type</TableHead>
            <TableHead>Item Name</TableHead>
            <TableHead>Total Quantity</TableHead>
            <TableHead>Total Value</TableHead>
            <TableHead>Total Value (IQD)</TableHead>
            <TableHead>Budget Type</TableHead>
            <TableHead>Recipient</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center">
                Loading...
              </TableCell>
            </TableRow>
          ) : !statistics?.length ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center">
                No results found
              </TableCell>
            </TableRow>
          ) : (
            statistics.map((stat, index) => (
              <TableRow 
                key={index}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => navigate(`/quotations/${stat.quotation_id}`)}
              >
                <TableCell>{stat.type_name || 'N/A'}</TableCell>
                <TableCell>{stat.item_name}</TableCell>
                <TableCell>{formatNumber(stat.total_quantity)}</TableCell>
                <TableCell>
                  {formatNumber(stat.total_value)} {stat.currency_type?.toUpperCase()}
                </TableCell>
                <TableCell>{formatNumber(stat.total_value_iqd)} IQD</TableCell>
                <TableCell>
                  {stat.budget_type === 'ma' ? 'MA' : 'Korek'}
                </TableCell>
                <TableCell>{stat.recipient || 'N/A'}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}