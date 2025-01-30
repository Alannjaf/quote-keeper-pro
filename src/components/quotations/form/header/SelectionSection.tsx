import { BudgetTypeSelect } from "../BudgetTypeSelect";
import { CurrencyTypeSelect } from "../CurrencyTypeSelect";
import { RecipientSelect } from "../RecipientSelect";
import { BudgetType, CurrencyType } from "@/types/quotation";
import { QueryClient } from "@tanstack/react-query";

interface SelectionSectionProps {
  budgetType: BudgetType;
  setBudgetType: (value: BudgetType) => void;
  recipient: string;
  setRecipient: (value: string) => void;
  currencyType: CurrencyType;
  setCurrencyType: (value: CurrencyType) => void;
  recipients?: string[];
  queryClient: QueryClient;
}

export function SelectionSection({
  budgetType,
  setBudgetType,
  recipient,
  setRecipient,
  currencyType,
  setCurrencyType,
  recipients,
  queryClient,
}: SelectionSectionProps) {
  return (
    <>
      <BudgetTypeSelect
        value={budgetType}
        onChange={setBudgetType}
      />

      <RecipientSelect
        recipient={recipient}
        setRecipient={setRecipient}
        recipients={recipients}
        queryClient={queryClient}
      />

      <CurrencyTypeSelect
        value={currencyType}
        onChange={setCurrencyType}
      />
    </>
  );
}