import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { addDays, parseISO } from "date-fns";
import { AppLayout } from "@/components/layout/AppLayout";
import { QuotationFormHeader } from "@/components/quotations/QuotationFormHeader";
import { VendorSection } from "@/components/quotations/VendorSection";
import { QuotationItemsTable } from "@/components/quotations/QuotationItemsTable";
import { QuotationStatusSelect } from "@/components/quotations/QuotationStatusSelect";
import { QuotationItem, BudgetType, CurrencyType } from "@/types/quotation";
import { formatNumber } from "@/lib/format";

export default function EditQuotation() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
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
  const [status, setStatus] = useState<"draft" | "pending" | "rejected" | "approved" | "invoiced">("draft");

  // Fetch quotation data
  const { data: quotation, refetch: refetchQuotation } = useQuery({
    queryKey: ['quotation', id],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from('quotations')
        .select(`
          *,
          vendor:vendors(name)
        `)
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    },
  });

  // Set up real-time subscription for quotation updates
  useEffect(() => {
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'quotations',
          filter: `id=eq.${id}`
        },
        () => {
          refetchQuotation();
          queryClient.invalidateQueries({ queryKey: ['quotationItems', id] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id, refetchQuotation, queryClient]);

  // Fetch quotation items
  const { data: quotationItems } = useQuery({
    queryKey: ['quotationItems', id],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from('quotation_items')
        .select('*')
        .eq('quotation_id', id);
      
      if (error) throw error;
      return data;
    },
  });

  // Fetch item types
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

  // Fetch vendors
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

  // Set initial data
  useEffect(() => {
    if (quotation) {
      setProjectName(quotation.project_name);
      setDate(parseISO(quotation.date));
      setValidityDate(parseISO(quotation.validity_date));
      setBudgetType(quotation.budget_type);
      setRecipient(quotation.recipient);
      setCurrencyType(quotation.currency_type);
      setVendorCurrencyType(quotation.vendor_currency_type);
      setVendorName(quotation.vendor?.name || "");
      setVendorCost(quotation.vendor_cost);
      setStatus(quotation.status);
    }
  }, [quotation]);

  useEffect(() => {
    if (quotationItems) {
      setItems(quotationItems);
    }
  }, [quotationItems]);

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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

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
            .insert({ name: vendorName, created_by: user.id })
            .select('id')
            .single();

          if (vendorError) throw vendorError;
          vendorId = newVendor.id;
        }
      }

      // Update quotation
      const { error: quotationError } = await supabase
        .from('quotations')
        .update({
          project_name: projectName,
          date: date.toISOString().split('T')[0],
          validity_date: validityDate.toISOString().split('T')[0],
          budget_type: budgetType,
          recipient,
          currency_type: currencyType,
          vendor_id: vendorId,
          vendor_cost: vendorCost,
          vendor_currency_type: vendorCurrencyType,
          status,
        })
        .eq('id', id);

      if (quotationError) throw quotationError;

      // Delete existing items
      const { error: deleteError } = await supabase
        .from('quotation_items')
        .delete()
        .eq('quotation_id', id);

      if (deleteError) throw deleteError;

      // Insert new items
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

      toast({
        title: "Success",
        description: "Quotation updated successfully",
      });

      // Stay on the same page after update
      refetchQuotation();
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
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight">
            Edit Quotation
          </h1>
          <QuotationStatusSelect
            id={id!}
            currentStatus={status}
            onStatusChange={setStatus}
          />
        </div>

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
            formatNumber={formatNumber}
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
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
