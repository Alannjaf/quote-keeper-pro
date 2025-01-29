import { useQuotationForm } from "@/hooks/use-quotation-form";
import { QuotationFormHeader } from "@/components/quotations/QuotationFormHeader";
import { VendorSection } from "@/components/quotations/VendorSection";
import { QuotationItemsTable } from "@/components/quotations/QuotationItemsTable";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface QuotationFormProps {
  mode?: "create" | "edit";
  id?: string;
  initialData?: any;
  vendors?: Array<{ id: string; name: string }>;
  itemTypes?: Array<{ id: string; name: string }>;
  onSuccess?: () => void;
}

export function QuotationForm({
  mode = "create",
  id,
  initialData,
  vendors,
  itemTypes,
  onSuccess,
}: QuotationFormProps) {
  const navigate = useNavigate();
  const {
    formState: {
      projectName,
      date,
      validityDate,
      budgetType,
      recipient,
      currencyType,
      vendorName,
      vendorCost,
      vendorCurrencyType,
      items,
      discount,
      note,
      isSubmitting
    },
    formActions: {
      setProjectName,
      setDate,
      setValidityDate,
      setBudgetType,
      setRecipient,
      setCurrencyType,
      setVendorName,
      setVendorCost,
      setVendorCurrencyType,
      setDiscount,
      setNote,
      addNewItem,
      updateItem,
      removeItem,
      handleSubmit
    }
  } = useQuotationForm({
    mode,
    id,
    initialData,
    onSuccess,
  });

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <QuotationFormHeader
        projectName={projectName}
        setProjectName={setProjectName}
        date={date}
        setDate={setDate}
        validityDate={validityDate}
        setValidityDate={setValidityDate}
        budgetType={budgetType}
        setBudgetType={setBudgetType}
        recipient={recipient}
        setRecipient={setRecipient}
        currencyType={currencyType}
        setCurrencyType={setCurrencyType}
        discount={discount}
        setDiscount={setDiscount}
        note={note}
        setNote={setNote}
      />

      <VendorSection
        vendorName={vendorName}
        setVendorName={setVendorName}
        vendorCost={vendorCost}
        setVendorCost={setVendorCost}
        vendorCurrencyType={vendorCurrencyType}
        setVendorCurrencyType={setVendorCurrencyType}
        vendors={vendors}
        formatNumber={formatNumber}
        quotationDate={date}
      />

      <QuotationItemsTable
        items={items}
        updateItem={updateItem}
        removeItem={removeItem}
        addNewItem={addNewItem}
        itemTypes={itemTypes}
        formatNumber={formatNumber}
      />

      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate('/quotations')}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {mode === 'create' ? 'Creating...' : 'Updating...'}
            </>
          ) : (
            <>{mode === 'create' ? 'Create Quotation' : 'Update Quotation'}</>
          )}
        </Button>
      </div>
    </form>
  );
}
