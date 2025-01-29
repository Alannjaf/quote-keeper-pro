import { useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { BudgetType, CurrencyType } from "@/types/quotation";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DateSelect } from "./form/DateSelect";
import { BudgetTypeSelect } from "./form/BudgetTypeSelect";
import { CurrencyTypeSelect } from "./form/CurrencyTypeSelect";
import { RecipientSelect } from "./form/RecipientSelect";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();

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

  // Check if exchange rate exists for selected date
  const { data: exchangeRate } = useQuery({
    queryKey: ['userExchangeRate', format(date, 'yyyy-MM-dd')],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from('exchange_rates')
        .select('rate')
        .eq('date', format(date, 'yyyy-MM-dd'))
        .eq('created_by', user.id)
        .maybeSingle();
      
      if (error) throw error;
      return data?.rate;
    },
  });

  // Show warning if no exchange rate is set for the selected date
  useEffect(() => {
    if (!exchangeRate) {
      toast({
        title: "Warning",
        description: "No exchange rate set for the selected date. Please set an exchange rate in the settings.",
        variant: "destructive",
      });
    }
  }, [date, exchangeRate, toast]);

  return (
    <div className="space-y-6">
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

        <div className="space-y-2">
          <Label htmlFor="discount">Discount Amount</Label>
          <Input
            id="discount"
            type="number"
            min="0"
            value={discount}
            onChange={(e) => setDiscount(Number(e.target.value))}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="note">Note</Label>
        <Textarea
          id="note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Add a note to this quotation"
          className="h-24"
        />
      </div>
    </div>
  );
}