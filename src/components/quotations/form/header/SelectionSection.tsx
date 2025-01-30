import { BudgetTypeSelect } from "../BudgetTypeSelect";
import { CurrencyTypeSelect } from "../CurrencyTypeSelect";
import { RecipientSelect } from "../RecipientSelect";
import { BudgetType, CurrencyType } from "@/types/quotation";

interface SelectionSectionProps {
  budgetType: BudgetType;
  setBudgetType: (value: BudgetType) => void;
  recipient: string;
  setRecipient: (value: string) => void;
  currencyType: CurrencyType;
  setCurrencyType: (value: CurrencyType) => void;
  recipients?: string[];
}

export function SelectionSection({
  budgetType,
  setBudgetType,
  recipient,
  setRecipient,
  currencyType,
  setCurrencyType,
  recipients,
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
      />

      <CurrencyTypeSelect
        value={currencyType}
        onChange={setCurrencyType}
      />
    </>
  );
}