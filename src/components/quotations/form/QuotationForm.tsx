import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { QuotationFormHeader } from "@/components/quotations/QuotationFormHeader";
import { VendorSection } from "@/components/quotations/VendorSection";
import { QuotationItemsTable } from "@/components/quotations/QuotationItemsTable";
import { QuotationItem, BudgetType, CurrencyType } from "@/types/quotation";
import { addDays } from "date-fns";
import { format } from "date-fns";
import { formatNumber } from "@/lib/format";

interface QuotationFormProps {
  mode: 'create' | 'edit';
  id?: string;
  onSuccess?: () => void;
  initialData?: any;
  vendors?: Array<{ id: string; name: string }>;
  itemTypes?: Array<{ id: string; name: string }>;
}

export function QuotationForm({ mode, id, onSuccess, initialData, vendors, itemTypes }: QuotationFormProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [projectName, setProjectName] = useState(initialData?.project_name || "");
  const [date, setDate] = useState<Date>(initialData?.date ? new Date(initialData.date) : new Date());
  const [validityDate, setValidityDate] = useState<Date>(
    initialData?.validity_date ? new Date(initialData.validity_date) : addDays(new Date(), 10)
  );
  const [budgetType, setBudgetType] = useState<BudgetType>(initialData?.budget_type || "ma");
  const [recipient, setRecipient] = useState(initialData?.recipient || "");
  const [currencyType, setCurrencyType] = useState<CurrencyType>(initialData?.currency_type || "iqd");
  const [vendorCurrencyType, setVendorCurrencyType] = useState<CurrencyType>(initialData?.vendor_currency_type || "iqd");
  const [vendorName, setVendorName] = useState(initialData?.vendor?.name || "");
  const [vendorCost, setVendorCost] = useState(initialData?.vendor_cost || 0);
  const [items, setItems] = useState<QuotationItem[]>(initialData?.items || []);
  const [discount, setDiscount] = useState(initialData?.discount || 0);
  const [note, setNote] = useState(initialData?.note || "");

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

      const quotationData = {
        project_name: projectName,
        date: format(date, 'yyyy-MM-dd'),
        validity_date: format(validityDate, 'yyyy-MM-dd'),
        budget_type: budgetType,
        recipient,
        currency_type: currencyType,
        vendor_id: vendorId,
        vendor_cost: vendorCost,
        vendor_currency_type: vendorCurrencyType,
        discount,
        note,
      };

      if (mode === 'create') {
        const { data: quotation, error: quotationError } = await supabase
          .from('quotations')
          .insert({
            ...quotationData,
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
            type_id: item.type_id,
            unit_price: item.unit_price,
            price: item.price,
            total_price: item.total_price,
          }));

          const { error: itemsError } = await supabase
            .from('quotation_items')
            .insert(quotationItems);

          if (itemsError) throw itemsError;
        }
      } else if (mode === 'edit' && id) {
        const { error: quotationError } = await supabase
          .from('quotations')
          .update(quotationData)
          .eq('id', id);

        if (quotationError) throw quotationError;

        const { error: deleteError } = await supabase
          .from('quotation_items')
          .delete()
          .eq('quotation_id', id);

        if (deleteError) throw deleteError;

        if (items.length > 0) {
          const quotationItems = items.map(item => ({
            quotation_id: id,
            name: item.name,
            description: item.description,
            quantity: item.quantity,
            type_id: item.type_id,
            unit_price: item.unit_price,
            price: item.price,
            total_price: item.total_price,
          }));

          const { error: itemsError } = await supabase
            .from('quotation_items')
            .insert(quotationItems);

          if (itemsError) throw itemsError;
        }
      }

      toast({
        title: "Success",
        description: mode === 'create' ? "Quotation created successfully" : "Quotation updated successfully",
      });

      if (onSuccess) {
        onSuccess();
      } else {
        navigate('/quotations');
      }
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
        discount={discount}
        setDiscount={setDiscount}
        note={note}
        setNote={setNote}
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
          {isSubmitting ? (mode === 'create' ? "Creating..." : "Saving...") : (mode === 'create' ? "Create Quotation" : "Save Changes")}
        </Button>
      </div>
    </form>
  );
}
