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
  const { items, addNewItem, updateItem, removeItem } = useItemsActions(initialData?.items);
  const { isSubmitting, handleSubmit: submitQuotation } = useQuotationSubmit({
    mode,
    id,
    onSuccess,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitQuotation({
      ...formState,
      items,
    });
  };

  return {
    formState: {
      ...formState,
      items,
      isSubmitting,
    },
    formActions: {
      setProjectName: (value: string) => formState.setProjectName(value),
      setDate: (date: Date) => formState.setDate(date),
      setValidityDate: (date: Date) => formState.setValidityDate(date),
      setBudgetType: (value: BudgetType) => formState.setBudgetType(value),
      setRecipient: (value: string) => formState.setRecipient(value),
      setCurrencyType: (value: CurrencyType) => formState.setCurrencyType(value),
      setVendorName: (value: string) => formState.setVendorName(value),
      setVendorCost: (value: number) => formState.setVendorCost(value),
      setVendorCurrencyType: (value: CurrencyType) => formState.setVendorCurrencyType(value),
      setDiscount: (value: number) => formState.setDiscount(value),
      setNote: (value: string) => formState.setNote(value),
      addNewItem,
      updateItem,
      removeItem,
      handleSubmit,
    },
  };
}