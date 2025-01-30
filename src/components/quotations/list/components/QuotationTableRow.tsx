import { TableCell, TableRow } from "@/components/ui/table";
import { QuotationStatusSelect } from "../../QuotationStatusSelect";
import { QuotationActions } from "../../QuotationActions";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { formatNumber, convertToIQD, calculateTotalPrice } from "../utils/formatters";
import { Database } from "@/integrations/supabase/types";

type QuotationWithRelations = Database['public']['Tables']['quotations']['Row'] & {
  quotation_items: Database['public']['Tables']['quotation_items']['Row'][];
  creator?: {
    first_name: string | null;
    last_name: string | null;
    email: string | null;
  } | null;
};

interface QuotationTableRowProps {
  quotation: QuotationWithRelations;
  exchangeRate: number;
  onDelete: () => void;
}

export function QuotationTableRow({ 
  quotation, 
  exchangeRate,
  onDelete 
}: QuotationTableRowProps) {
  const navigate = useNavigate();

  return (
    <TableRow className="group">
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
        {formatNumber(convertToIQD(quotation.vendor_cost, quotation.vendor_currency_type, exchangeRate))} IQD
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
  );
}