import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { FilterBudgetType, FilterQuotationStatus } from "@/types/quotation";
import { SearchInput } from "./SearchInput";
import { FilterSelects } from "./FilterSelects";
import { DateRangeFilter } from "./DateRangeFilter";

interface FilterSectionProps {
  projectName: string;
  onProjectNameChange: (value: string) => void;
  budgetType: FilterBudgetType | null;
  onBudgetTypeChange: (value: FilterBudgetType) => void;
  status: FilterQuotationStatus | null;
  onStatusChange: (value: FilterQuotationStatus) => void;
  startDate?: Date;
  onStartDateChange: (date?: Date) => void;
  endDate?: Date;
  onEndDateChange: (date?: Date) => void;
  onExport: () => void;
  createdBy: string | null;
  onCreatedByChange: (value: string) => void;
  users?: Array<{ id: string; first_name: string; last_name: string; email: string }>;
  isAdmin?: boolean;
}

export function FilterSection({
  projectName,
  onProjectNameChange,
  budgetType,
  onBudgetTypeChange,
  status,
  onStatusChange,
  startDate,
  onStartDateChange,
  endDate,
  onEndDateChange,
  onExport,
  createdBy,
  onCreatedByChange,
  users,
  isAdmin,
}: FilterSectionProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <SearchInput value={projectName} onChange={onProjectNameChange} />
        
        <FilterSelects
          budgetType={budgetType}
          setBudgetType={onBudgetTypeChange}
          status={status}
          setStatus={onStatusChange}
          createdBy={createdBy}
          setCreatedBy={onCreatedByChange}
          users={users}
          isAdmin={isAdmin}
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <DateRangeFilter
          startDate={startDate}
          setStartDate={onStartDateChange}
          endDate={endDate}
          setEndDate={onEndDateChange}
        />

        <Button
          variant="outline"
          className="w-full sm:w-auto ml-auto"
          onClick={onExport}
        >
          <Download className="mr-2 h-4 w-4" />
          Export to Excel
        </Button>
      </div>
    </div>
  );
}