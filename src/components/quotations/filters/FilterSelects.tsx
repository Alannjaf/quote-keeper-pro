import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FilterBudgetType, FilterQuotationStatus } from "@/types/quotation";

interface FilterSelectsProps {
  budgetType: FilterBudgetType | null;
  setBudgetType: (value: FilterBudgetType) => void;
  status: FilterQuotationStatus | null;
  setStatus: (value: FilterQuotationStatus) => void;
  createdBy: string | null;
  setCreatedBy: (value: string) => void;
  users?: Array<{ id: string; first_name: string; last_name: string; email: string }>;
  isAdmin?: boolean;
}

export function FilterSelects({
  budgetType,
  setBudgetType,
  status,
  setStatus,
  createdBy,
  setCreatedBy,
  users,
  isAdmin,
}: FilterSelectsProps) {
  return (
    <>
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

      {isAdmin && (
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
    </>
  );
}