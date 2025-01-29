import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type QuotationStatus = "draft" | "pending" | "rejected" | "approved" | "invoiced";

interface QuotationStatusBadgeProps {
  status: QuotationStatus;
  className?: string;
}

const statusColors = {
  draft: "bg-gradient-to-r from-gray-400/20 to-gray-500/20 text-gray-700 dark:text-gray-300",
  pending: "bg-gradient-to-r from-yellow-400/20 to-orange-500/20 text-yellow-700 dark:text-yellow-300",
  rejected: "bg-gradient-to-r from-red-400/20 to-pink-500/20 text-red-700 dark:text-red-300",
  approved: "bg-gradient-to-r from-green-400/20 to-emerald-500/20 text-green-700 dark:text-green-300",
  invoiced: "bg-gradient-to-r from-blue-400/20 to-indigo-500/20 text-blue-700 dark:text-blue-300",
};

export function QuotationStatusBadge({ status, className }: QuotationStatusBadgeProps) {
  return (
    <Badge 
      variant="secondary" 
      className={cn(
        "capitalize cursor-grab active:cursor-grabbing font-medium",
        statusColors[status],
        className
      )}
    >
      {status}
    </Badge>
  );
}