import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { BudgetType, CurrencyType } from "@/types/quotation";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DateSelect } from "./form/DateSelect";
import { BudgetTypeSelect } from "./form/BudgetTypeSelect";
import { CurrencyTypeSelect } from "./form/CurrencyTypeSelect";
import { RecipientSelect } from "./form/RecipientSelect";

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
}: QuotationFormHeaderProps) {
  // Fetch existing recipients
  const { data: recipients } = useQuery({
    queryKey: ['recipients'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('quotations')
        .select('recipient')
        .not('recipient', 'eq', '')
        .order('recipient');
      
      if (error) throw error;
      
      // Get unique recipients
      const uniqueRecipients = Array.from(new Set(data.map(q => q.recipient)));
      return uniqueRecipients;
    },
  });

  return (
    <div className="grid grid-cols-2 gap-6">
      <div className="space-y-2">
        <Label htmlFor="projectName">Project Name</Label>
        <Input
          id="projectName"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          required
        />
      </div>

      <DateSelect
        label="Date"
        date={date}
        onSelect={(date) => date && setDate(date)}
      />

      <DateSelect
        label="Validity Date"
        date={validityDate}
        onSelect={(date) => date && setValidityDate(date)}
      />

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
    </div>
  );
}