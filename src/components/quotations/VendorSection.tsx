import { useEffect, useState } from "react";
import { CurrencyType } from "@/types/quotation";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { VendorNameSelect } from "./vendor/VendorNameSelect";
import { VendorCostInput } from "./vendor/VendorCostInput";
import { VendorCurrencySelect } from "./vendor/VendorCurrencySelect";

interface VendorSectionProps {
  vendorName: string;
  setVendorName: (value: string) => void;
  vendorCost: number;
  setVendorCost: (value: number) => void;
  vendorCurrencyType: CurrencyType;
  setVendorCurrencyType: (value: CurrencyType) => void;
  formatNumber?: (num: number) => string;
  quotationDate: Date;
}

export function VendorSection({
  vendorName,
  setVendorName,
  vendorCost,
  setVendorCost,
  vendorCurrencyType,
  setVendorCurrencyType,
  formatNumber = (num: number) => num.toString(),
  quotationDate,
}: VendorSectionProps) {
  const [convertedCost, setConvertedCost] = useState(vendorCost);

  const { data: exchangeRate } = useQuery({
    queryKey: ['userExchangeRate', format(quotationDate, 'yyyy-MM-dd')],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from('exchange_rates')
        .select('rate')
        .eq('date', format(quotationDate, 'yyyy-MM-dd'))
        .eq('created_by', user.id)
        .maybeSingle();
      
      if (error) throw error;
      return data?.rate || null;
    },
  });

  useEffect(() => {
    if (exchangeRate && vendorCurrencyType === 'iqd') {
      setConvertedCost(vendorCost / exchangeRate);
    } else if (exchangeRate && vendorCurrencyType === 'usd') {
      setConvertedCost(vendorCost * exchangeRate);
    } else {
      setConvertedCost(vendorCost);
    }
  }, [vendorCost, vendorCurrencyType, exchangeRate]);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Vendor Information</h2>
      <div className="grid grid-cols-3 gap-4">
        <VendorNameSelect
          vendorName={vendorName}
          setVendorName={setVendorName}
        />
        <VendorCostInput
          vendorCost={vendorCost}
          setVendorCost={setVendorCost}
          vendorCurrencyType={vendorCurrencyType}
          formatNumber={formatNumber}
          convertedCost={convertedCost}
          exchangeRate={exchangeRate}
        />
        <VendorCurrencySelect
          vendorCurrencyType={vendorCurrencyType}
          setVendorCurrencyType={setVendorCurrencyType}
        />
      </div>
    </div>
  );
}