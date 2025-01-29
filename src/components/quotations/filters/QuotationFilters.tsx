import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarIcon, Download } from "lucide-react";
import { format } from "date-fns";
import { BudgetType, FilterBudgetType, QuotationStatus, FilterQuotationStatus } from "@/types/quotation";

interface QuotationFiltersProps {
  onFilterChange: (filters: {
    projectName: string;
    budgetType: FilterBudgetType | null;
    status: FilterQuotationStatus | null;
    startDate?: Date;
    endDate?: Date;
  }) => void;
  onExport: () => void;
}

export function QuotationFilters({ onFilterChange, onExport }: QuotationFiltersProps) {
  const [projectName, setProjectName] = useState("");
  const [budgetType, setBudgetType] = useState<FilterBudgetType | null>(null);
  const [status, setStatus] = useState<FilterQuotationStatus | null>(null);
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();

  const handleFilterChange = () => {
    onFilterChange({
      projectName,
      budgetType,
      status,
      startDate,
      endDate,
    });
  };

  return (
    <div className="space-y-4 mb-8">
      <div className="flex flex-col sm:flex-row gap-4">
        <Input
          placeholder="Search by project name..."
          value={projectName}
          onChange={(e) => {
            setProjectName(e.target.value);
            handleFilterChange();
          }}
          className="w-full sm:w-[300px]"
        />
        
        <Select
          value={budgetType ?? undefined}
          onValueChange={(value: FilterBudgetType) => {
            setBudgetType(value);
            handleFilterChange();
          }}
        >
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Budget Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="ma">MA</SelectItem>
            <SelectItem value="korek_communication">Korek</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={status ?? undefined}
          onValueChange={(value: FilterQuotationStatus) => {
            setStatus(value);
            handleFilterChange();
          }}
        >
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="invoiced">Invoiced</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex gap-4">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full sm:w-[200px]">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {startDate ? format(startDate, "PPP") : "Start Date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={(date) => {
                  setStartDate(date);
                  handleFilterChange();
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full sm:w-[200px]">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {endDate ? format(endDate, "PPP") : "End Date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={endDate}
                onSelect={(date) => {
                  setEndDate(date);
                  handleFilterChange();
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

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