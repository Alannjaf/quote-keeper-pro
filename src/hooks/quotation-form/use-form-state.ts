import { useState } from "react";
import { QuotationItem } from "@/types/quotation";
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
  const [budgetType, setBudgetType] = useState(initialData?.budget_type || "ma");
  const [recipient, setRecipient] = useState(initialData?.recipient || "");
  const [currencyType, setCurrencyType] = useState(initialData?.currency_type || "iqd");
  const [vendorCurrencyType, setVendorCurrencyType] = useState(
    initialData?.vendor_currency_type || "iqd"
  );
  const [vendorName, setVendorName] = useState(initialData?.vendor?.name || "");
  const [vendorCost, setVendorCost] = useState(initialData?.vendor_cost || 0);
  const [items, setItems] = useState<QuotationItem[]>(initialData?.items || []);
  const [discount, setDiscount] = useState(initialData?.discount || 0);
  const [note, setNote] = useState(initialData?.note || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  return {
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
    isSubmitting,
  };
}