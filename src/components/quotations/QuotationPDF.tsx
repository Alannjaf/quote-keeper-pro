import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { FileDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatNumber } from "@/lib/format";
import jsPDF from "jspdf";
import 'jspdf-autotable';
import { UserOptions } from "jspdf-autotable";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: UserOptions) => jsPDF;
  }
}

interface QuotationPDFProps {
  quotationId: string;
}

export function QuotationPDF({ quotationId }: QuotationPDFProps) {
  const { toast } = useToast();

  const { data: quotation } = useQuery({
    queryKey: ['quotation', quotationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('quotations')
        .select(`
          *,
          items:quotation_items(*)
        `)
        .eq('id', quotationId)
        .single();
      
      if (error) throw error;
      return data;
    },
  });

  const { data: companySettings } = useQuery({
    queryKey: ['companySettings'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from('company_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
  });

  const generatePDF = async (isTechnical: boolean = false) => {
    if (!quotation) return;

    try {
      const doc = new jsPDF();
      
      // Add company logo if exists
      if (companySettings?.logo_url) {
        const img = new Image();
        img.src = companySettings.logo_url;
        await new Promise((resolve) => {
          img.onload = resolve;
        });
        const imgWidth = 45;
        const imgHeight = (img.height * imgWidth) / img.width;
        doc.addImage(img, 'JPEG', 15, 15, imgWidth, imgHeight);
      }

      // Add "Technical" text for technical version
      if (isTechnical) {
        doc.setFontSize(16);
        doc.text("Technical", doc.internal.pageSize.width - 40, 30);
      }

      // Add header information with reduced spacing
      doc.setFontSize(12);
      doc.text(`Quotation #: ${quotation.quotation_number}`, 15, 65);
      doc.text(`To: ${quotation.recipient}`, 15, 72);
      doc.text(`Date: ${new Date(quotation.date).toLocaleDateString()}`, 15, 79);
      doc.text(`Valid Until: ${new Date(quotation.validity_date).toLocaleDateString()}`, 15, 86);

      // Add items table
      const tableData = quotation.items.map((item: any) => {
        if (isTechnical) {
          return [
            item.name,
            item.description || '',
            item.quantity,
          ];
        }
        return [
          item.name,
          item.description || '',
          item.quantity,
          formatNumber(item.unit_price),
          formatNumber(item.total_price),
        ];
      });

      const tableHeaders = isTechnical 
        ? [['Item', 'Description', 'Quantity']]
        : [['Item', 'Description', 'Quantity', `Unit Price (${quotation.currency_type.toUpperCase()})`, `Total (${quotation.currency_type.toUpperCase()})`]];

      doc.autoTable({
        startY: 95,
        head: tableHeaders,
        body: tableData,
        headStyles: {
          fillColor: [128, 0, 128],
        },
        styles: {
          lineColor: [0, 0, 0],
          lineWidth: 0.1,
        },
        theme: 'grid',
      });

      // Add totals with reduced spacing (only for non-technical version)
      if (!isTechnical) {
        const finalY = (doc as any).lastAutoTable.finalY + 5;
        const totalAmount = quotation.items.reduce((sum: number, item: any) => sum + item.total_price, 0);
        const discountAmount = quotation.discount || 0;
        const finalTotal = totalAmount - discountAmount;

        doc.text(`Subtotal: ${formatNumber(totalAmount)} ${quotation.currency_type.toUpperCase()}`, 15, finalY);
        doc.text(`Discount: ${formatNumber(discountAmount)} ${quotation.currency_type.toUpperCase()}`, 15, finalY + 7);
        doc.text(`Total: ${formatNumber(finalTotal)} ${quotation.currency_type.toUpperCase()}`, 15, finalY + 14);
      }

      // Add note if exists
      if (quotation.note) {
        const noteY = isTechnical ? (doc as any).lastAutoTable.finalY + 5 : (doc as any).lastAutoTable.finalY + 25;
        const noteText = 'Note: ' + quotation.note;
        const splitNote = doc.splitTextToSize(noteText, 180);
        doc.text(splitNote, 15, noteY);
      }

      // Add company address in footer if exists
      if (companySettings?.company_address) {
        doc.setFontSize(10);
        const splitAddress = doc.splitTextToSize(companySettings.company_address, 180);
        doc.text(splitAddress, 15, doc.internal.pageSize.height - 20);
      }

      // Save the PDF
      const fileName = `quotation-${quotation.quotation_number}-${quotation.project_name}${isTechnical ? '-technical' : ''}.pdf`;
      doc.save(fileName);

      toast({
        title: "Success",
        description: "PDF generated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          <FileDown className="h-4 w-4 mr-2" />
          Download PDF
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => generatePDF(false)}>
          Regular Version
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => generatePDF(true)}>
          Technical Version
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}