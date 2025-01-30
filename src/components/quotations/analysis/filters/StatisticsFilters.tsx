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
  selectedBudget: string;
  onBudgetChange: (value: string) => void;
  selectedRecipient: string;
  onRecipientChange: (value: string) => void;
  recipients?: string[];
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
  selectedBudget,
  onBudgetChange,
  selectedRecipient,
  onRecipientChange,
  recipients,
}: StatisticsFiltersProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Input
          placeholder="Search by item or type name..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        <Select
          value={selectedTypeId}
          onValueChange={onTypeChange}
        >
          <SelectTrigger>
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

        <Select
          value={selectedBudget}
          onValueChange={onBudgetChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Filter by budget" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Budgets</SelectItem>
            <SelectItem value="ma">MA</SelectItem>
            <SelectItem value="korek_communication">Korek</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={selectedRecipient}
          onValueChange={onRecipientChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Filter by recipient" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Recipients</SelectItem>
            {recipients?.map((recipient) => (
              <SelectItem key={recipient} value={recipient}>
                {recipient}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 flex-grow">
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
        <Button variant="outline" onClick={onExport} className="w-full sm:w-auto">
          <Download className="mr-2 h-4 w-4" />
          Export to Excel
        </Button>
      </div>
    </div>
  );
}