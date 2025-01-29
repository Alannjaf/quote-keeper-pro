import { useNavigate } from "react-router-dom";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { QuotationStatusSelect } from "@/components/quotations/QuotationStatusSelect";
import { QuotationActions } from "@/components/quotations/QuotationActions";
import { format } from "date-fns";
import { Database } from "@/integrations/supabase/types";

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
}

export function QuotationList({ quotations, isLoading, onDelete, exchangeRate = 1 }: QuotationListProps) {
  const navigate = useNavigate();

  const calculateTotalPrice = (items: any[], discount: number = 0) => {
    const subtotal = items?.reduce((sum, item) => sum + (item.total_price || 0), 0) || 0;
    return subtotal - discount;
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString('en-US');
  };

  const convertToIQD = (amount: number, currency: string) => {
    return currency === 'usd' ? amount * exchangeRate : amount;
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Project Name</TableHead>
            <TableHead>To</TableHead>
            <TableHead>Created By</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Vendor Cost (IQD)</TableHead>
            <TableHead>Total Items Value</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center">
                Loading...
              </TableCell>
            </TableRow>
          ) : quotations?.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center">
                No quotations found
              </TableCell>
            </TableRow>
          ) : (
            quotations?.map((quotation) => (
              <TableRow 
                key={quotation.id}
                className="group"
              >
                <TableCell 
                  className="cursor-pointer hover:underline"
                  onClick={() => navigate(`/quotations/${quotation.id}`)}
                >
                  {quotation.project_name}
                </TableCell>
                <TableCell>{quotation.recipient}</TableCell>
                <TableCell>
                  {quotation.creator ? (
                    <span className="text-sm">
                      {quotation.creator.first_name} {quotation.creator.last_name}
                      <br />
                      <span className="text-muted-foreground">
                        {quotation.creator.email}
                      </span>
                    </span>
                  ) : 'Unknown'}
                </TableCell>
                <TableCell>
                  <QuotationStatusSelect
                    id={quotation.id}
                    currentStatus={quotation.status}
                  />
                </TableCell>
                <TableCell>
                  {formatNumber(convertToIQD(quotation.vendor_cost, quotation.vendor_currency_type))} IQD
                </TableCell>
                <TableCell>
                  {formatNumber(calculateTotalPrice(quotation.quotation_items, quotation.discount))} {quotation.currency_type.toUpperCase()}
                </TableCell>
                <TableCell>
                  {format(new Date(quotation.created_at), 'PPP')}
                </TableCell>
                <TableCell>
                  <QuotationActions id={quotation.id} onDelete={onDelete} />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}