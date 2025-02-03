import { QuotationStatusBadge } from "@/components/quotations/QuotationStatusBadge";
import { QuotationStatusSelect } from "@/components/quotations/QuotationStatusSelect";
import { QuotationActions } from "@/components/quotations/QuotationActions";
import { TableCell, TableRow } from "@/components/ui/table";
import { formatDate, formatNumber } from "../utils/formatters";
import { Link } from "react-router-dom";
import { QuotationStatus } from "@/types/quotation";

interface QuotationTableRowProps {
  quotation: {
    id: string;
    project_name: string;
    recipient: string;
    date: string;
    status: QuotationStatus;
    vendor_cost: number;
    vendor_currency_type: string;
    currency_type: string;
    discount: number;
    quotation_items: any[];
    created_by: string | null;
    creator?: {
      first_name: string | null;
      last_name: string | null;
      email: string | null;
    } | null;
  };
  onStatusChange: (id: string, newStatus: QuotationStatus) => void;
  onDelete: () => void;
}

export function QuotationTableRow({
  quotation,
  onStatusChange,
  onDelete,
}: QuotationTableRowProps) {
  const totalItemsCost = quotation.quotation_items?.reduce((sum, item) => 
    sum + (item.total_price || 0), 0) - (quotation.discount || 0);

  const creatorName = quotation.creator
    ? `${quotation.creator.first_name || ''} ${quotation.creator.last_name || ''}`
    : 'Unknown';

  return (
    <TableRow>
      <TableCell>
        <Link
          to={`/quotations/${quotation.id}`}
          className="text-primary hover:underline"
        >
          {quotation.project_name}
        </Link>
      </TableCell>
      <TableCell>{quotation.recipient}</TableCell>
      <TableCell>{creatorName.trim()}</TableCell>
      <TableCell>
        <QuotationStatusSelect
          id={quotation.id}
          currentStatus={quotation.status}
          onStatusChange={(newStatus) => onStatusChange(quotation.id, newStatus)}
        />
      </TableCell>
      <TableCell>{formatDate(quotation.date)}</TableCell>
      <TableCell>
        {formatNumber(quotation.vendor_cost)} {quotation.vendor_currency_type.toUpperCase()}
      </TableCell>
      <TableCell>
        {formatNumber(totalItemsCost)} {quotation.currency_type.toUpperCase()}
      </TableCell>
      <TableCell>
        <QuotationActions 
          id={quotation.id} 
          createdBy={quotation.created_by}
          onDelete={onDelete} 
        />
      </TableCell>
    </TableRow>
  );
}