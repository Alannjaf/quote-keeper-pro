import { useState, useEffect } from "react";
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
import { FilterBudgetType, FilterQuotationStatus } from "@/types/quotation";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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
}

export function QuotationFilters({ onFilterChange, onExport, initialFilters }: QuotationFiltersProps) {
  const [projectName, setProjectName] = useState(initialFilters?.projectName || "");
  const [budgetType, setBudgetType] = useState<FilterBudgetType | null>(initialFilters?.budgetType || null);
  const [status, setStatus] = useState<FilterQuotationStatus | null>(initialFilters?.status || null);
  const [startDate, setStartDate] = useState<Date | undefined>(initialFilters?.startDate);
  const [endDate, setEndDate] = useState<Date | undefined>(initialFilters?.endDate);
  const [createdBy, setCreatedBy] = useState<string | null>(initialFilters?.createdBy || null);

  // Fetch current user's role
  const { data: currentUserProfile } = useQuery({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      
      if (error) throw error;
      return data;
    },
  });

  // Fetch users for admin filter
  const { data: users } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email')
        .order('first_name');
      
      if (error) throw error;
      return data;
    },
    enabled: currentUserProfile?.role === 'admin',
  });

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
        <Input
          placeholder="Search by project name..."
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          className="w-full sm:w-[300px]"
        />
        
        <Select
          value={budgetType ?? undefined}
          onValueChange={(value: FilterBudgetType) => setBudgetType(value)}
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
          onValueChange={(value: FilterQuotationStatus) => setStatus(value)}
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

        {currentUserProfile?.role === 'admin' && (
          <Select
            value={createdBy ?? undefined}
            onValueChange={(value) => setCreatedBy(value)}
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
                onSelect={setStartDate}
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
                onSelect={setEndDate}
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