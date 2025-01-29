import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function ExchangeRateSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [rate, setRate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // Query for current day's rate
  const { data: currentRate, isLoading: isLoadingCurrent } = useQuery({
    queryKey: ['currentExchangeRate', format(selectedDate, 'yyyy-MM-dd')],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('exchange_rates')
        .select('*')
        .eq('date', format(selectedDate, 'yyyy-MM-dd'))
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
  });

  // Query for historical rates
  const { data: historicalRates, isLoading: isLoadingHistorical } = useQuery({
    queryKey: ['historicalExchangeRates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('exchange_rates')
        .select('*')
        .order('date', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return data;
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      
      if (currentRate) {
        // Update existing rate
        const { error } = await supabase
          .from('exchange_rates')
          .update({ rate: parseFloat(rate) })
          .eq('date', dateStr);
        
        if (error) throw error;
      } else {
        // Insert new rate
        const { error } = await supabase
          .from('exchange_rates')
          .insert([{ date: dateStr, rate: parseFloat(rate) }]);
        
        if (error) throw error;
      }

      queryClient.invalidateQueries({ queryKey: ['currentExchangeRate'] });
      queryClient.invalidateQueries({ queryKey: ['historicalExchangeRates'] });
      
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

  if (isLoadingCurrent) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-8 md:grid-cols-2">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="rate">Exchange Rate (USD to IQD)</Label>
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

        <div className="space-y-2">
          <Label>Select Date</Label>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => date && setSelectedDate(date)}
            className="border rounded-md"
          />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Historical Exchange Rates</h3>
        {isLoadingHistorical ? (
          <div>Loading historical rates...</div>
        ) : (
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Rate (USD to IQD)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {historicalRates && historicalRates.length > 0 ? (
                  historicalRates.map((rate) => (
                    <TableRow key={rate.id}>
                      <TableCell>{format(new Date(rate.date), 'PPP')}</TableCell>
                      <TableCell>{rate.rate}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center">
                      No historical rates found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}