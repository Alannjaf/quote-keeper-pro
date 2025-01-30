import { Table, TableBody } from "@/components/ui/table";
import { DataPagination } from "@/components/ui/data-pagination";
import { Database } from "@/integrations/supabase/types";
import { QuotationTableHeader } from "./components/QuotationTableHeader";
import { QuotationTableRow } from "./components/QuotationTableRow";
import { calculateTotalPrice } from "./utils/formatters";

type QuotationWithRelations = Database['public']['Tables']['quotations']['Row'] & {
  quotation_items: Database['public']['Tables']['quotation_items']['Row'][];
  creator?: {
    first_name: string | null;
    last_name: string | null;
    email: string | null;
  } | null;
};

interface QuotationListProps {
  quotations?: QuotationWithRelations[];
  isLoading: boolean;
  onDelete: () => void;
  exchangeRate?: number;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function QuotationList({ 
  quotations, 
  isLoading, 
  onDelete, 
  exchangeRate = 1,
  currentPage,
  totalPages,
  onPageChange,
}: QuotationListProps) {
  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <QuotationTableHeader />
          <TableBody>
            {isLoading ? (
              <tr>
                <td colSpan={8} className="text-center p-4">
                  Loading...
                </td>
              </tr>
            ) : quotations?.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center p-4">
                  No quotations found
                </td>
              </tr>
            ) : (
              quotations?.map((quotation) => (
                <QuotationTableRow
                  key={quotation.id}
                  quotation={{
                    ...quotation,
                    total_amount: calculateTotalPrice(quotation.quotation_items, quotation.discount)
                  }}
                  onStatusChange={() => {}} // Add proper status change handler if needed
                  onDelete={onDelete}
                />
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <DataPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
        />
      )}
    </div>
  );
}