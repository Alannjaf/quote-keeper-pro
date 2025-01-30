import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { Label } from "@/components/ui/label";
import { RateForm } from "./exchange-rate/RateForm";
import { RateHistory } from "./exchange-rate/RateHistory";

export function ExchangeRateSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

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

  const { data: historicalRates, isLoading: isLoadingHistorical } = useQuery({
    queryKey: ['historicalExchangeRates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('exchange_rates')
        .select('*')
        .order('date', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return data;
    },
  });

  const handleSubmit = async (rate: string) => {
    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user found');
      
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      
      if (currentRate) {
        const { error } = await supabase
          .from('exchange_rates')
          .update({ 
            rate: parseFloat(rate),
            created_by: user.id 
          })
          .eq('date', dateStr);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('exchange_rates')
          .insert([{ 
            date: dateStr, 
            rate: parseFloat(rate),
            created_by: user.id 
          }]);
        
        if (error) throw error;
      }

      await queryClient.invalidateQueries({ 
        queryKey: ['currentExchangeRate', dateStr] 
      });
      await queryClient.invalidateQueries({ 
        queryKey: ['historicalExchangeRates'] 
      });
      
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
    <div className="max-w-full overflow-hidden">
      <div className="grid gap-8 md:grid-cols-2">
        <div className="w-full min-w-0">
          <RateForm
            currentRate={currentRate}
            selectedDate={selectedDate}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        </div>

        <div className="w-full min-w-0">
          <Label>Select Date</Label>
          <div className="flex justify-center w-full mt-2">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              className="w-[350px] rounded-md border bg-background"
            />
          </div>
        </div>
      </div>

      <div className="mt-8 w-full min-w-0">
        <RateHistory
          rates={historicalRates || []}
          isLoading={isLoadingHistorical}
        />
      </div>
    </div>
  );
}