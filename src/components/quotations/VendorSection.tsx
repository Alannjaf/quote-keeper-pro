import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CurrencyType } from "@/types/quotation";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface VendorSectionProps {
  vendorName: string;
  setVendorName: (value: string) => void;
  vendorCost: number;
  setVendorCost: (value: number) => void;
  vendorCurrencyType: CurrencyType;
  setVendorCurrencyType: (value: CurrencyType) => void;
  vendors?: Array<{ id: string; name: string }>;
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
  vendors = [],
  formatNumber = (num: number) => num.toString(),
  quotationDate,
}: VendorSectionProps) {
  const [convertedCost, setConvertedCost] = useState(vendorCost);

  // Fetch exchange rate for the specific user and date
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

  // Update converted cost when vendor cost or currency type changes
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
        <div className="space-y-2">
          <Label htmlFor="vendorName">Vendor Name</Label>
          <Select value={vendorName} onValueChange={setVendorName}>
            <SelectTrigger>
              <SelectValue placeholder="Select vendor..." />
            </SelectTrigger>
            <SelectContent>
              {vendors?.map((vendor) => (
                <SelectItem key={vendor.id} value={vendor.name}>
                  {vendor.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="vendorCost">Vendor Cost</Label>
          <div className="relative">
            <Input
              id="vendorCost"
              type="number"
              value={vendorCost}
              onChange={(e) => setVendorCost(Number(e.target.value))}
              required
              className="pr-20"
            />
            <div className="absolute right-2 top-2 text-sm text-muted-foreground">
              {formatNumber(vendorCost)} {vendorCurrencyType.toUpperCase()}
              {exchangeRate && (
                <div className="text-xs">
                  ≈ {formatNumber(convertedCost)} {vendorCurrencyType === 'usd' ? 'IQD' : 'USD'}
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="vendorCurrencyType">Currency</Label>
          <Select
            value={vendorCurrencyType}
            onValueChange={(value: CurrencyType) => setVendorCurrencyType(value)}
          >
            <SelectTrigger id="vendorCurrencyType">
              <SelectValue placeholder="Select currency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="usd">USD</SelectItem>
              <SelectItem value="iqd">IQD</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}