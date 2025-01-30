import { FilterSection } from "@/components/quotations/filters/FilterSection";
import { QuotationListContainer } from "@/components/quotations/list/QuotationListContainer";

interface QuotationListSectionProps {
  filters: any;
  setFilters: (filters: any) => void;
  currentUserProfile: any;
  users?: any[];
  onDataChange: (data: any[]) => void;
  handleExport: () => void;
}

export function QuotationListSection({
  filters,
  setFilters,
  currentUserProfile,
  users,
  onDataChange,
  handleExport,
}: QuotationListSectionProps) {
  return (
    <div className="glass-card p-4 sm:p-6 rounded-lg">
      <h2 className="text-2xl font-semibold mb-4 gradient-text">
        Quotations List
      </h2>
      <FilterSection 
        projectName={filters.projectName}
        onProjectNameChange={(value) => setFilters(prev => ({ ...prev, projectName: value }))}
        budgetType={filters.budgetType}
        onBudgetTypeChange={(value) => setFilters(prev => ({ ...prev, budgetType: value }))}
        status={filters.status}
        onStatusChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
        startDate={filters.startDate}
        onStartDateChange={(date) => setFilters(prev => ({ ...prev, startDate: date }))}
        endDate={filters.endDate}
        onEndDateChange={(date) => setFilters(prev => ({ ...prev, endDate: date }))}
        onExport={handleExport}
        createdBy={filters.createdBy || null}
        onCreatedByChange={(value) => setFilters(prev => ({ ...prev, createdBy: value }))}
        users={users}
        isAdmin={currentUserProfile?.role === 'admin'}
      />

      <QuotationListContainer 
        filters={filters}
        currentUserProfile={currentUserProfile}
        onDataChange={onDataChange}
      />
    </div>
  );
}