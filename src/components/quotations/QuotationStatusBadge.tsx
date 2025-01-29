import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type QuotationStatus = "draft" | "pending" | "rejected" | "approved" | "invoiced";

interface QuotationStatusBadgeProps {
  status: QuotationStatus;
  className?: string;
}

const statusColors = {
  draft: "bg-gray-500/20 text-gray-700 hover:bg-gray-500/30",
  pending: "bg-yellow-500/20 text-yellow-700 hover:bg-yellow-500/30",
  rejected: "bg-red-500/20 text-red-700 hover:bg-red-500/30",
  approved: "bg-green-500/20 text-green-700 hover:bg-green-500/30",
  invoiced: "bg-blue-500/20 text-blue-700 hover:bg-blue-500/30",
};

export function QuotationStatusBadge({ status, className }: QuotationStatusBadgeProps) {
  return (
    <Badge 
      variant="secondary" 
      className={cn(
        "capitalize cursor-grab active:cursor-grabbing",
        statusColors[status],
        className
      )}
    >
      {status}
    </Badge>
  );
}