import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { BudgetType, CurrencyType } from "@/types/quotation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
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
  const { toast } = useToast();
  const [newRecipient, setNewRecipient] = useState("");
  const [isAddingRecipient, setIsAddingRecipient] = useState(false);

  // Fetch existing recipients
  const { data: recipients, refetch: refetchRecipients } = useQuery({
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

  const handleAddRecipient = async () => {
    if (!newRecipient.trim()) {
      toast({
        title: "Error",
        description: "Recipient name cannot be empty",
        variant: "destructive",
      });
      return;
    }

    setRecipient(newRecipient);
    setNewRecipient("");
    setIsAddingRecipient(false);
    await refetchRecipients();

    toast({
      title: "Success",
      description: "New recipient added successfully",
    });
  };

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

      <div className="space-y-2">
        <Label>Date</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-full justify-start text-left font-normal",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "PPP") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(date) => date && setDate(date)}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="space-y-2">
        <Label>Validity Date</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-full justify-start text-left font-normal",
                !validityDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {validityDate ? format(validityDate, "PPP") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={validityDate}
              onSelect={(date) => date && setValidityDate(date)}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="space-y-2">
        <Label>Budget Type</Label>
        <RadioGroup
          value={budgetType}
          onValueChange={(value: BudgetType) => setBudgetType(value)}
          className="flex gap-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="ma" id="ma" />
            <Label htmlFor="ma">MA</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="korek_communication" id="korek" />
            <Label htmlFor="korek">Korek Communication</Label>
          </div>
        </RadioGroup>
      </div>

      <div className="space-y-2">
        <Label htmlFor="recipient">To</Label>
        {isAddingRecipient ? (
          <div className="flex gap-2">
            <Input
              value={newRecipient}
              onChange={(e) => setNewRecipient(e.target.value)}
              placeholder="Enter new recipient"
              className="flex-1"
            />
            <Button onClick={handleAddRecipient} className="shrink-0">
              Add
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setIsAddingRecipient(false)}
              className="shrink-0"
            >
              Cancel
            </Button>
          </div>
        ) : (
          <div className="flex gap-2">
            <Select value={recipient} onValueChange={setRecipient}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Select recipient..." />
              </SelectTrigger>
              <SelectContent>
                {recipients?.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button 
              variant="outline" 
              onClick={() => setIsAddingRecipient(true)}
              className="shrink-0"
            >
              New
            </Button>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label>Quotation Currency Type</Label>
        <RadioGroup
          value={currencyType}
          onValueChange={(value: CurrencyType) => setCurrencyType(value)}
          className="flex gap-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="usd" id="usd" />
            <Label htmlFor="usd">USD</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="iqd" id="iqd" />
            <Label htmlFor="iqd">IQD</Label>
          </div>
        </RadioGroup>
      </div>
    </div>
  );
}