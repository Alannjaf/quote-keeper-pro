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
    date: string;
    budget_type: string;
    status: QuotationStatus;
    total_amount: number;
    currency_type: string;
    created_by: string | null;
  };
  onStatusChange: (id: string, newStatus: QuotationStatus) => void;
  onDelete: () => void;
}

export function QuotationTableRow({
  quotation,
  onStatusChange,
  onDelete,
}: QuotationTableRowProps) {
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
      <TableCell>{formatDate(quotation.date)}</TableCell>
      <TableCell className="capitalize">{quotation.budget_type}</TableCell>
      <TableCell>
        <QuotationStatusSelect
          id={quotation.id}
          currentStatus={quotation.status}
          onStatusChange={(newStatus) => onStatusChange(quotation.id, newStatus)}
        />
      </TableCell>
      <TableCell>
        {formatNumber(quotation.total_amount)} {quotation.currency_type.toUpperCase()}
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