import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { addDays } from "date-fns";
import { format } from "date-fns";
import { AppLayout } from "@/components/layout/AppLayout";
import { QuotationFormHeader } from "@/components/quotations/QuotationFormHeader";
import { VendorSection } from "@/components/quotations/VendorSection";
import { QuotationItemsTable } from "@/components/quotations/QuotationItemsTable";
import { QuotationItem, BudgetType, CurrencyType } from "@/types/quotation";

export default function NewQuotation() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [date, setDate] = useState<Date>(new Date());
  const [validityDate, setValidityDate] = useState<Date>(addDays(new Date(), 10));
  const [budgetType, setBudgetType] = useState<BudgetType>("ma");
  const [recipient, setRecipient] = useState("");
  const [currencyType, setCurrencyType] = useState<CurrencyType>("iqd");
  const [vendorCurrencyType, setVendorCurrencyType] = useState<CurrencyType>("iqd");
  const [vendorName, setVendorName] = useState("");
  const [vendorCost, setVendorCost] = useState(0);
  const [items, setItems] = useState<QuotationItem[]>([]);

  const formatNumber = (num: number) => {
    return num.toLocaleString('en-US');
  };

  const { data: itemTypes } = useQuery({
    queryKey: ['itemTypes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('item_types')
        .select('*');
      if (error) throw error;
      return data;
    },
  });

  const { data: vendors } = useQuery({
    queryKey: ['vendors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vendors')
        .select('*');
      if (error) throw error;
      return data;
    },
  });

  const addNewItem = () => {
    const newItem: QuotationItem = {
      id: crypto.randomUUID(),
      name: "",
      description: "",
      quantity: 0,
      type_id: null,
      unit_price: 0,
      price: 0,
      total_price: 0,
    };
    setItems([...items, newItem]);
  };

  const updateItem = (id: string, field: keyof QuotationItem, value: any) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        if (field === 'quantity' || field === 'unit_price') {
          updatedItem.total_price = updatedItem.quantity * updatedItem.unit_price;
          updatedItem.price = updatedItem.unit_price;
        }
        return updatedItem;
      }
      return item;
    }));
  };

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let vendorId = null;
      if (vendorName) {
        const { data: existingVendor } = await supabase
          .from('vendors')
          .select('id')
          .eq('name', vendorName)
          .maybeSingle();

        if (existingVendor) {
          vendorId = existingVendor.id;
        } else {
          const { data: newVendor, error: vendorError } = await supabase
            .from('vendors')
            .insert({ 
              name: vendorName,
              created_by: (await supabase.auth.getUser()).data.user?.id 
            })
            .select('id')
            .single();

          if (vendorError) throw vendorError;
          vendorId = newVendor.id;
        }
      }

      const { data: quotation, error: quotationError } = await supabase
        .from('quotations')
        .insert({
          project_name: projectName,
          date: format(date, 'yyyy-MM-dd'),
          validity_date: format(validityDate, 'yyyy-MM-dd'),
          budget_type: budgetType,
          recipient,
          currency_type: currencyType,
          vendor_id: vendorId,
          vendor_cost: vendorCost,
          vendor_currency_type: vendorCurrencyType,
          created_by: (await supabase.auth.getUser()).data.user?.id,
          status: 'draft'
        })
        .select('id')
        .single();

      if (quotationError) throw quotationError;

      if (items.length > 0) {
        const quotationItems = items.map(item => ({
          quotation_id: quotation.id,
          name: item.name,
          description: item.description,
          quantity: item.quantity,
          type_id: item.type_id || null, // Ensure type_id is null if not set
          unit_price: item.unit_price,
          price: item.price,
          total_price: item.total_price,
        }));

        const { error: itemsError } = await supabase
          .from('quotation_items')
          .insert(quotationItems);

        if (itemsError) throw itemsError;
      }

      toast({
        title: "Success",
        description: "Quotation created successfully",
      });

      navigate('/quotations');
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

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold tracking-tight mb-8">
          Create New Quotation
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <QuotationFormHeader
            projectName={projectName}
            setProjectName={setProjectName}
            date={date}
            setDate={setDate}
            validityDate={validityDate}
            setValidityDate={setValidityDate}
            budgetType={budgetType}
            setBudgetType={setBudgetType}
            recipient={recipient}
            setRecipient={setRecipient}
            currencyType={currencyType}
            setCurrencyType={setCurrencyType}
          />

          <VendorSection
            vendorName={vendorName}
            setVendorName={setVendorName}
            vendorCost={vendorCost}
            setVendorCost={setVendorCost}
            vendorCurrencyType={vendorCurrencyType}
            setVendorCurrencyType={setVendorCurrencyType}
            vendors={vendors}
          />

          <QuotationItemsTable
            items={items}
            updateItem={updateItem}
            removeItem={removeItem}
            addNewItem={addNewItem}
            itemTypes={itemTypes}
            formatNumber={formatNumber}
          />

          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/quotations')}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Quotation"}
            </Button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}