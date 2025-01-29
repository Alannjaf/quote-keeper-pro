import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface RateHistoryProps {
  rates: any[];
  isLoading: boolean;
}

export function RateHistory({ rates, isLoading }: RateHistoryProps) {
  if (isLoading) {
    return <div>Loading historical rates...</div>;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Historical Exchange Rates</h3>
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Rate (USD to IQD)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rates && rates.length > 0 ? (
              rates.map((rate) => (
                <TableRow key={rate.id}>
                  <TableCell>{format(new Date(rate.date), 'PPP')}</TableCell>
                  <TableCell>{rate.rate}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={2} className="text-center">
                  No historical rates found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}