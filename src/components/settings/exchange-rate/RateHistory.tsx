import { useState } from "react";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DataPagination } from "@/components/ui/data-pagination";

interface RateHistoryProps {
  rates: any[];
  isLoading: boolean;
}

export function RateHistory({ rates, isLoading }: RateHistoryProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  if (isLoading) {
    return <div>Loading historical rates...</div>;
  }

  const totalPages = Math.ceil(rates.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentRates = rates.slice(startIndex, endIndex);

  return (
    <div className="space-y-4 min-w-0">
      <h3 className="text-lg font-medium">Historical Exchange Rates</h3>
      <div className="relative w-full overflow-auto border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="whitespace-nowrap">Date</TableHead>
              <TableHead className="whitespace-nowrap">Rate (USD to IQD)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentRates && currentRates.length > 0 ? (
              currentRates.map((rate) => (
                <TableRow key={rate.id}>
                  <TableCell className="whitespace-nowrap">{format(new Date(rate.date), 'PPP')}</TableCell>
                  <TableCell className="whitespace-nowrap">{rate.rate}</TableCell>
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
      {rates.length > itemsPerPage && (
        <div className="flex justify-center mt-4">
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