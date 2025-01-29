import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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

interface StatisticsTableProps {
  statistics?: ItemStatistic[];
  isLoading: boolean;
}

export function StatisticsTable({ statistics, isLoading }: StatisticsTableProps) {
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
  );
}