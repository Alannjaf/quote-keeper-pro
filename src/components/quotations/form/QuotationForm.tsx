import { Button } from "@/components/ui/button";
import { QuotationFormHeader } from "@/components/quotations/QuotationFormHeader";
import { VendorSection } from "@/components/quotations/VendorSection";
import { QuotationItemsTable } from "@/components/quotations/QuotationItemsTable";
import { useQuotationForm } from "@/hooks/use-quotation-form";
import { formatNumber } from "@/lib/format";

interface QuotationFormProps {
  mode: 'create' | 'edit';
  id?: string;
  onSuccess?: () => void;
  initialData?: any;
  vendors?: Array<{ id: string; name: string }>;
  itemTypes?: Array<{ id: string; name: string }>;
}

export function QuotationForm({ 
  mode, 
  id, 
  onSuccess, 
  initialData, 
  vendors, 
  itemTypes 
}: QuotationFormProps) {
  const { formState, formActions } = useQuotationForm({
    mode,
    id,
    onSuccess,
    initialData
  });

  return (
    <form onSubmit={formActions.handleSubmit} className="space-y-6">
      <QuotationFormHeader
        projectName={formState.projectName}
        setProjectName={formActions.setProjectName}
        date={formState.date}
        setDate={formActions.setDate}
        validityDate={formState.validityDate}
        setValidityDate={formActions.setValidityDate}
        budgetType={formState.budgetType}
        setBudgetType={formActions.setBudgetType}
        recipient={formState.recipient}
        setRecipient={formActions.setRecipient}
        currencyType={formState.currencyType}
        setCurrencyType={formActions.setCurrencyType}
        discount={formState.discount}
        setDiscount={formActions.setDiscount}
        note={formState.note}
        setNote={formActions.setNote}
      />

      <VendorSection
        vendorName={formState.vendorName}
        setVendorName={formActions.setVendorName}
        vendorCost={formState.vendorCost}
        setVendorCost={formActions.setVendorCost}
        vendorCurrencyType={formState.vendorCurrencyType}
        setVendorCurrencyType={formActions.setVendorCurrencyType}
        vendors={vendors}
        formatNumber={formatNumber}
      />

      <QuotationItemsTable
        items={formState.items}
        updateItem={formActions.updateItem}
        removeItem={formActions.removeItem}
        addNewItem={formActions.addNewItem}
        itemTypes={itemTypes}
        formatNumber={formatNumber}
      />

      <div className="flex gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate('/quotations')}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={formState.isSubmitting}>
          {formState.isSubmitting ? 
            (mode === 'create' ? "Creating..." : "Saving...") : 
            (mode === 'create' ? "Create Quotation" : "Save Changes")}
        </Button>
      </div>
    </form>
  );
}