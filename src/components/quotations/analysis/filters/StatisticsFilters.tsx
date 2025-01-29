import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { DateSelect } from "@/components/quotations/form/DateSelect";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface StatisticsFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedTypeId: string;
  onTypeChange: (value: string) => void;
  startDate?: Date;
  onStartDateChange: (date: Date | undefined) => void;
  endDate?: Date;
  onEndDateChange: (date: Date | undefined) => void;
  onExport: () => void;
  itemTypes?: Array<{ id: string; name: string }>;
}

export function StatisticsFilters({
  searchTerm,
  onSearchChange,
  selectedTypeId,
  onTypeChange,
  startDate,
  onStartDateChange,
  endDate,
  onEndDateChange,
  onExport,
  itemTypes,
}: StatisticsFiltersProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col sm:flex-row gap-4">
          <Input
            placeholder="Search by item or type name..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full sm:w-[300px]"
          />
          <Select
            value={selectedTypeId}
            onValueChange={onTypeChange}
          >
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {itemTypes?.map((type) => (
                <SelectItem key={type.id} value={type.id}>
                  {type.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button variant="outline" onClick={onExport}>
          <Download className="mr-2 h-4 w-4" />
          Export to Excel
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <DateSelect
          label="Start Date"
          date={startDate}
          onSelect={onStartDateChange}
        />
        <DateSelect
          label="End Date"
          date={endDate}
          onSelect={onEndDateChange}
        />
      </div>
    </div>
  );
}