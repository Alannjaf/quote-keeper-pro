import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarIcon, Download } from "lucide-react";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FilterSectionProps {
  projectName: string;
  onProjectNameChange: (value: string) => void;
  budgetType: string | null;
  onBudgetTypeChange: (value: string) => void;
  status: string | null;
  onStatusChange: (value: string) => void;
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
    <div className="space-y-4 mb-8">
      <div className="flex flex-col sm:flex-row gap-4">
        <Input
          placeholder="Search by project name..."
          value={projectName}
          onChange={(e) => onProjectNameChange(e.target.value)}
          className="w-full sm:w-[300px]"
        />
        
        <Select
          value={budgetType ?? undefined}
          onValueChange={onBudgetTypeChange}
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
          onValueChange={onStatusChange}
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

        {isAdmin && (
          <Select
            value={createdBy ?? undefined}
            onValueChange={onCreatedByChange}
          >
            <SelectTrigger className="w-full sm:w-[250px]">
              <SelectValue placeholder="Filter by creator" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Users</SelectItem>
              {users?.map((user) => (
                <SelectItem key={user.id} value={user.id}>
                  {user.first_name} {user.last_name} ({user.email})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
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
                onSelect={onStartDateChange}
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
                onSelect={onEndDateChange}
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