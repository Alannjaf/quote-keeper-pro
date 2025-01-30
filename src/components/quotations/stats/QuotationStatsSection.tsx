import { QuotationStats } from "@/components/quotations/analysis/QuotationStats";
import { ItemStatistics } from "@/components/quotations/analysis/ItemStatistics";

interface QuotationStatsSectionProps {
  filters: any;
}

export function QuotationStatsSection({ filters }: QuotationStatsSectionProps) {
  return (
    <>
      <div className="glass-card p-4 sm:p-6 rounded-lg">
        <QuotationStats filters={filters} />
      </div>

      <div className="glass-card p-4 sm:p-6 rounded-lg">
        <h2 className="text-2xl font-semibold mb-4 gradient-text">
          Item Statistics
        </h2>
        <ItemStatistics />
      </div>
    </>
  );
}