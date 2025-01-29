import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export function ExchangeRateSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [rate, setRate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: currentRate, isLoading } = useQuery({
    queryKey: ['currentExchangeRate'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('exchange_rates')
        .select('*')
        .eq('date', new Date().toISOString().split('T')[0])
        .single();
      
      if (error) throw error;
      return data;
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const today = new Date().toISOString().split('T')[0];
      
      if (currentRate) {
        // Update existing rate
        const { error } = await supabase
          .from('exchange_rates')
          .update({ rate: parseFloat(rate) })
          .eq('date', today);
        
        if (error) throw error;
      } else {
        // Insert new rate
        const { error } = await supabase
          .from('exchange_rates')
          .insert([{ date: today, rate: parseFloat(rate) }]);
        
        if (error) throw error;
      }

      queryClient.invalidateQueries({ queryKey: ['currentExchangeRate'] });
      
      toast({
        title: "Success",
        description: "Exchange rate updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="rate">Today's Exchange Rate (USD to IQD)</Label>
        <Input
          id="rate"
          type="number"
          step="0.01"
          value={rate || currentRate?.rate || ""}
          onChange={(e) => setRate(e.target.value)}
          placeholder="Enter exchange rate"
        />
      </div>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Saving..." : "Update Exchange Rate"}
      </Button>
    </form>
  );
}