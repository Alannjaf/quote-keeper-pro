import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { BudgetType } from "@/types/quotation";

interface BudgetTypeSelectProps {
  value: BudgetType;
  onChange: (value: BudgetType) => void;
}

export function BudgetTypeSelect({ value, onChange }: BudgetTypeSelectProps) {
  return (
    <div className="space-y-2">
      <Label>Budget Type</Label>
      <RadioGroup
        value={value}
        onValueChange={(value: BudgetType) => onChange(value)}
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
  );
}