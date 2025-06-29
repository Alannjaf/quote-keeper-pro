import { BudgetType, CurrencyType } from "@/types/quotation";
import { ProjectNameInput } from "./form/header/ProjectNameInput";
import { DiscountInput } from "./form/header/DiscountInput";
import { NoteInput } from "./form/header/NoteInput";
import { ExchangeRateWarning } from "./form/header/ExchangeRateWarning";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DateSection } from "./form/header/DateSection";
import { SelectionSection } from "./form/header/SelectionSection";

interface QuotationFormHeaderProps {
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
  discount: number;
  setDiscount: (value: number) => void;
  note: string;
  setNote: (value: string) => void;
}

export function QuotationFormHeader({
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
  discount,
  setDiscount,
  note,
  setNote,
}: QuotationFormHeaderProps) {
  const queryClient = useQueryClient();

  // Fetch recipients from the new recipients table
  const { data: recipients } = useQuery({
    queryKey: ['recipients'],
    queryFn: async () => {
      console.log('Fetching recipients...');
      const { data, error } = await supabase
        .from('recipients')
        .select('name')
        .order('name');
      
      if (error) {
        console.error('Error fetching recipients:', error);
        throw error;
      }
      
      const recipientNames = data.map(r => r.name);
      console.log('Fetched recipients:', recipientNames);
      return recipientNames;
    },
  });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        <ProjectNameInput
          projectName={projectName}
          setProjectName={setProjectName}
        />

        <DateSection
          date={date}
          setDate={setDate}
          validityDate={validityDate}
          setValidityDate={setValidityDate}
        />

        <SelectionSection
          budgetType={budgetType}
          setBudgetType={setBudgetType}
          recipient={recipient}
          setRecipient={setRecipient}
          currencyType={currencyType}
          setCurrencyType={setCurrencyType}
          recipients={recipients}
          queryClient={queryClient}
        />

        <DiscountInput
          discount={discount}
          setDiscount={setDiscount}
        />
      </div>

      <NoteInput
        note={note}
        setNote={setNote}
      />

      <ExchangeRateWarning date={date} />
    </div>
  );
}