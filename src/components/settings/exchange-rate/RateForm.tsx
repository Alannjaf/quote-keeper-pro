import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

interface RateFormProps {
  currentRate: any;
  selectedDate: Date;
  onSubmit: (rate: string) => Promise<void>;
  isSubmitting: boolean;
}

export function RateForm({ currentRate, selectedDate, onSubmit, isSubmitting }: RateFormProps) {
  const [rate, setRate] = useState("");

  useEffect(() => {
    // Update rate when currentRate changes
    if (currentRate?.rate) {
      setRate(currentRate.rate.toString());
    } else {
      setRate("");
    }
  }, [currentRate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(rate);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-full space-y-4">
      <div className="w-full space-y-2">
        <Label htmlFor="rate">Exchange Rate (USD to IQD) for {format(selectedDate, 'PPP')}</Label>
        <Input
          id="rate"
          type="number"
          step="0.01"
          value={rate}
          onChange={(e) => setRate(e.target.value)}
          placeholder="Enter exchange rate"
          required
          className="w-full"
        />
      </div>
      <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
        {isSubmitting ? "Saving..." : "Update Exchange Rate"}
      </Button>
    </form>
  );
}