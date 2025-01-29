import { BudgetType, CurrencyType, QuotationItem } from "@/types/quotation";

export type QuotationFormMode = 'create' | 'edit';

export interface QuotationFormState {
  projectName: string;
  date: Date;
  validityDate: Date;
  budgetType: BudgetType;
  recipient: string;
  currencyType: CurrencyType;
  vendorName: string;
  vendorCost: number;
  vendorCurrencyType: CurrencyType;
  items: QuotationItem[];
  discount: number;
  note: string;
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