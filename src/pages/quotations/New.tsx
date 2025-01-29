import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { addDays } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon, Plus, Trash } from "lucide-react";
import { format } from "date-fns";

type QuotationItem = {
  id: string;
  name: string;
  description: string;
  quantity: number;
  type_id: string | null;
  unit_price: number;
  price: number;
  total_price: number;
};

export default function NewQuotation() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [date, setDate] = useState<Date>(new Date());
  const [validityDate, setValidityDate] = useState<Date>(addDays(new Date(), 10));
  const [budgetType, setBudgetType] = useState<"ma" | "korek_communication">("ma");
  const [recipient, setRecipient] = useState("");
  const [currencyType, setCurrencyType] = useState<"usd" | "iqd">("iqd");
  const [vendorCurrencyType, setVendorCurrencyType] = useState<"usd" | "iqd">("iqd");
  const [vendorName, setVendorName] = useState("");
  const [vendorCost, setVendorCost] = useState(0);
  const [items, setItems] = useState<QuotationItem[]>([]);

  const formatNumber = (num: number) => {
    return num.toLocaleString('en-US');
  };

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
          .single();

        if (existingVendor) {
          vendorId = existingVendor.id;
        } else {
          const { data: newVendor, error: vendorError } = await supabase
            .from('vendors')
            .insert({ name: vendorName })
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
          price: item.unit_price,
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
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="projectName">Project Name</Label>
              <Input
                id="projectName"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(date) => date && setDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Validity Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !validityDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {validityDate ? format(validityDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={validityDate}
                    onSelect={(date) => date && setValidityDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Budget Type</Label>
              <RadioGroup
                value={budgetType}
                onValueChange={(value: "ma" | "korek_communication") => setBudgetType(value)}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="ma" id="ma" />
                  <Label htmlFor="ma">MA</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="korek_communication" id="korek" />
                  <Label htmlFor="korek">Korek Communication</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="recipient">To</Label>
              <Input
                id="recipient"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Quotation Currency Type</Label>
              <RadioGroup
                value={currencyType}
                onValueChange={(value: "usd" | "iqd") => setCurrencyType(value)}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="usd" id="usd" />
                  <Label htmlFor="usd">USD</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="iqd" id="iqd" />
                  <Label htmlFor="iqd">IQD</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="vendorName">Vendor Name</Label>
              <Input
                id="vendorName"
                value={vendorName}
                onChange={(e) => setVendorName(e.target.value)}
                list="vendorsList"
              />
              <datalist id="vendorsList">
                {vendors?.map((vendor) => (
                  <option key={vendor.id} value={vendor.name} />
                ))}
              </datalist>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Vendor Currency Type</Label>
                <RadioGroup
                  value={vendorCurrencyType}
                  onValueChange={(value: "usd" | "iqd") => setVendorCurrencyType(value)}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="usd" id="vendor_usd" />
                    <Label htmlFor="vendor_usd">USD</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="iqd" id="vendor_iqd" />
                    <Label htmlFor="vendor_iqd">IQD</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="vendorCost">Vendor Cost</Label>
                <Input
                  id="vendorCost"
                  type="number"
                  value={vendorCost}
                  onChange={(e) => setVendorCost(Number(e.target.value))}
                  required
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Items</h2>
              <Button type="button" onClick={addNewItem}>
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Unit Price</TableHead>
                  <TableHead>Total Price</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <Input
                        value={item.name}
                        onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                        required
                      />
                    </TableCell>
                    <TableCell>
                      <Textarea
                        value={item.description}
                        onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateItem(item.id, 'quantity', Number(e.target.value))}
                        required
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={item.type_id || ''}
                        onChange={(e) => updateItem(item.id, 'type_id', e.target.value)}
                        list={`typesList-${item.id}`}
                      />
                      <datalist id={`typesList-${item.id}`}>
                        {itemTypes?.map((type) => (
                          <option key={type.id} value={type.id}>
                            {type.name}
                          </option>
                        ))}
                      </datalist>
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={item.unit_price}
                        onChange={(e) => updateItem(item.id, 'unit_price', Number(e.target.value))}
                        required
                      />
                    </TableCell>
                    <TableCell>
                      {formatNumber(item.total_price)}
                    </TableCell>
                    <TableCell>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeItem(item.id)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

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
