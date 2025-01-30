import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { FilterBudgetType, FilterQuotationStatus } from "@/types/quotation";
import { SearchInput } from "./SearchInput";
import { FilterSelects } from "./FilterSelects";
import { DateRangeFilter } from "./DateRangeFilter";

interface QuotationFiltersProps {
  onFilterChange: (filters: {
    projectName: string;
    budgetType: FilterBudgetType | null;
    status: FilterQuotationStatus | null;
    startDate?: Date;
    endDate?: Date;
    createdBy?: string | null;
  }) => void;
  onExport: () => void;
  initialFilters?: {
    projectName: string;
    budgetType: FilterBudgetType | null;
    status: FilterQuotationStatus | null;
    startDate?: Date;
    endDate?: Date;
    createdBy?: string | null;
  };
  users?: Array<{ id: string; first_name: string; last_name: string; email: string }>;
  isAdmin?: boolean;
}

export function QuotationFilters({
  onFilterChange,
  onExport,
  initialFilters,
  users,
  isAdmin,
}: QuotationFiltersProps) {
  const [projectName, setProjectName] = useState(initialFilters?.projectName || "");
  const [budgetType, setBudgetType] = useState<FilterBudgetType | null>(
    initialFilters?.budgetType || null
  );
  const [status, setStatus] = useState<FilterQuotationStatus | null>(
    initialFilters?.status || null
  );
  const [startDate, setStartDate] = useState<Date | undefined>(
    initialFilters?.startDate
  );
  const [endDate, setEndDate] = useState<Date | undefined>(
    initialFilters?.endDate
  );
  const [createdBy, setCreatedBy] = useState<string | null>(
    initialFilters?.createdBy || null
  );

  useEffect(() => {
    handleFilterChange();
  }, [projectName, budgetType, status, startDate, endDate, createdBy]);

  const handleFilterChange = () => {
    onFilterChange({
      projectName,
      budgetType,
      status,
      startDate,
      endDate,
      createdBy,
    });
  };

  return (
    <div className="space-y-4 mb-8">
      <div className="flex flex-col sm:flex-row gap-4">
        <SearchInput value={projectName} onChange={setProjectName} />
        
        <FilterSelects
          budgetType={budgetType}
          setBudgetType={setBudgetType}
          status={status}
          setStatus={setStatus}
          createdBy={createdBy}
          setCreatedBy={setCreatedBy}
          users={users}
          isAdmin={isAdmin}
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <DateRangeFilter
          startDate={startDate}
          setStartDate={setStartDate}
          endDate={endDate}
          setEndDate={setEndDate}
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