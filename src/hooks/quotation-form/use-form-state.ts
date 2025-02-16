
import { useState } from "react";
import { BudgetType, CurrencyType } from "@/types/quotation";
import { QuotationFormState } from "./types";
import { addDays } from "date-fns";

export function useFormState(initialData?: any): QuotationFormState {
  const [projectName, setProjectName] = useState(initialData?.project_name || "");
  const [date, setDate] = useState<Date>(
    initialData?.date ? new Date(initialData.date) : new Date()
  );
  const [validityDate, setValidityDate] = useState<Date>(
    initialData?.validity_date ? new Date(initialData.validity_date) : addDays(new Date(), 10)
  );
  const [budgetType, setBudgetType] = useState<BudgetType>(initialData?.budget_type || "ma");
  const [recipient, setRecipient] = useState(initialData?.recipient || "");
  const [currencyType, setCurrencyType] = useState<CurrencyType>(initialData?.currency_type || "iqd");
  const [vendorCurrencyType, setVendorCurrencyType] = useState<CurrencyType>(
    initialData?.vendor_currency_type || "iqd"
  );
  const [vendorName, setVendorName] = useState(initialData?.vendor?.name || "");
  const [vendorCost, setVendorCost] = useState(initialData?.vendor_cost || 0);
  const [discount, setDiscount] = useState(initialData?.discount || 0);
  const [note, setNote] = useState(initialData?.note || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  return {
    projectName,
    setProjectName,
    date,
    setDate,
    validityDate,
    setValidityDate,
    budgetType,
    setBudgetType,
    recipient,
    setRecipient,
    currencyType,
    setCurrencyType,
    vendorName,
    setVendorName,
    vendorCost,
    setVendorCost,
    vendorCurrencyType,
    setVendorCurrencyType,
    discount,
    setDiscount,
    note,
    setNote,
    isSubmitting,
  };
}
