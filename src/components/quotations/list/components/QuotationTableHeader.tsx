import { TableHead, TableHeader, TableRow } from "@/components/ui/table";

export function QuotationTableHeader() {
  return (
    <TableHeader>
      <TableRow>
        <TableHead>Project Name</TableHead>
        <TableHead>To</TableHead>
        <TableHead>Created By</TableHead>
        <TableHead>Status</TableHead>
        <TableHead>Date</TableHead>
        <TableHead>Vendor Cost</TableHead>
        <TableHead>Total Items Cost</TableHead>
        <TableHead className="w-[50px]"></TableHead>
      </TableRow>
    </TableHeader>
  );
}