import { format } from "date-fns";

export const formatNumber = (num: number) => {
  return num.toLocaleString('en-US');
};

export const formatDate = (date: string) => {
  return format(new Date(date), 'PPP');
};

export const convertToIQD = (amount: number, currency: string, exchangeRate: number) => {
  return currency === 'usd' ? amount * exchangeRate : amount;
};

export const calculateTotalPrice = (items: any[], discount: number = 0) => {
  const subtotal = items?.reduce((sum, item) => sum + (item.total_price || 0), 0) || 0;
  return subtotal - discount;
};