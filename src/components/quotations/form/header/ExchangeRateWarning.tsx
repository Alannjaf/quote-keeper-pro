
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface ExchangeRateWarningProps {
  date: Date;
}

export function ExchangeRateWarning({ date }: ExchangeRateWarningProps) {
  const { toast } = useToast();

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
      return data?.rate || null;
    },
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  useEffect(() => {
    if (exchangeRate === null) {
      toast({
        title: "Warning",
        description: "No exchange rate set for the selected date. Please set an exchange rate in the settings.",
        variant: "destructive",
      });
    }
  }, [date, exchangeRate, toast]);

  return null;
}
