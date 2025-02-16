
import { useFormState } from "./quotation-form/use-form-state";
import { useItemsActions } from "./quotation-form/use-items-actions";
import { useQuotationSubmit } from "./quotation-form/use-quotation-submit";
import { QuotationFormMode } from "./quotation-form/types";

interface UseQuotationFormProps {
  mode: QuotationFormMode;
  id?: string;
  initialData?: any;
  onSuccess?: () => void;
}

export function useQuotationForm({
  mode,
  id,
  initialData,
  onSuccess,
}: UseQuotationFormProps) {
  const formState = useFormState(initialData);
  const itemsState = useItemsActions(initialData?.items || []);
  const { isSubmitting, handleSubmit: submitQuotation } = useQuotationSubmit({
    mode,
    id,
    onSuccess,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitQuotation({
      ...formState,
      items: itemsState.items,
    });
  };

  return {
    formState: {
      ...formState,
      items: itemsState.items,
      isSubmitting,
    },
    formActions: {
      setProjectName: formState.setProjectName,
      setDate: formState.setDate,
      setValidityDate: formState.setValidityDate,
      setBudgetType: formState.setBudgetType,
      setRecipient: formState.setRecipient,
      setCurrencyType: formState.setCurrencyType,
      setVendorName: formState.setVendorName,
      setVendorCost: formState.setVendorCost,
      setVendorCurrencyType: formState.setVendorCurrencyType,
      setDiscount: formState.setDiscount,
      setNote: formState.setNote,
      addNewItem: itemsState.addNewItem,
      updateItem: itemsState.updateItem,
      removeItem: itemsState.removeItem,
      handleSubmit,
    },
  };
}
