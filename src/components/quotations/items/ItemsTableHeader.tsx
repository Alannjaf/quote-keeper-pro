import { TableHead, TableHeader, TableRow } from "@/components/ui/table";

export function ItemsTableHeader() {
  return (
    <TableHeader>
      <TableRow className="[&>th]:px-1">
        <TableHead className="w-[15%]">Item Name</TableHead>
        <TableHead className="w-[20%]">Description</TableHead>
        <TableHead className="w-[8%]">Quantity</TableHead>
        <TableHead className="w-[20%]">Type</TableHead>
        <TableHead className="w-[15%]">Unit Price</TableHead>
        <TableHead className="w-[10%]">Total Price</TableHead>
        <TableHead className="w-[2%]"></TableHead>
      </TableRow>
    </TableHeader>
  );
}