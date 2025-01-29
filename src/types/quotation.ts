export type QuotationItem = {
  id: string;
  name: string;
  description: string;
  quantity: number;
  type_id: string | null;
  unit_price: number;
  price: number;
  total_price: number;
};

export type BudgetType = "ma" | "korek_communication";
export type CurrencyType = "usd" | "iqd";