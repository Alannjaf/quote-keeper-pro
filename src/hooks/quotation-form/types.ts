
import { BudgetType, CurrencyType, QuotationItem } from "@/types/quotation";

export type QuotationFormMode = 'create' | 'edit';

export interface QuotationFormState {
  projectName: string;
  setProjectName: (value: string) => void;
  date: Date;
  setDate: (date: Date) => void;
  validityDate: Date;
  setValidityDate: (date: Date) => void;
  budgetType: BudgetType;
  setBudgetType: (value: BudgetType) => void;
  recipient: string;
  setRecipient: (value: string) => void;
  currencyType: CurrencyType;
  setCurrencyType: (value: CurrencyType) => void;
  vendorName: string;
  setVendorName: (value: string) => void;
  vendorCost: number;
  setVendorCost: (value: number) => void;
  vendorCurrencyType: CurrencyType;
  setVendorCurrencyType: (value: CurrencyType) => void;
  discount: number;
  setDiscount: (value: number) => void;
  note: string;
  setNote: (value: string) => void;
  isSubmitting: boolean;
}

export interface QuotationFormActions {
  setProjectName: (value: string) => void;
  setDate: (date: Date) => void;
  setValidityDate: (date: Date) => void;
  setBudgetType: (value: BudgetType) => void;
  setRecipient: (value: string) => void;
  setCurrencyType: (value: CurrencyType) => void;
  setVendorName: (value: string) => void;
  setVendorCost: (value: number) => void;
  setVendorCurrencyType: (value: CurrencyType) => void;
  setDiscount: (value: number) => void;
  setNote: (value: string) => void;
  addNewItem: () => void;
  updateItem: (id: string, field: keyof QuotationItem, value: any) => void;
  removeItem: (id: string) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
}
