interface QuotationItemsTableProps {
  items: any[];
  formatNumber: (num: number) => string;
  currencyType: string;
  subtotal: number;
  discount: number;
  totalAmount: number;
}

export function QuotationItemsTable({
  items,
  formatNumber,
  currencyType,
  subtotal,
  discount,
  totalAmount
}: QuotationItemsTableProps) {
  return (
    <div className="border rounded-lg">
      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="px-4 py-2 text-left">Item Name</th>
            <th className="px-4 py-2 text-left">Description</th>
            <th className="px-4 py-2 text-right">Quantity</th>
            <th className="px-4 py-2 text-right">Unit Price ({currencyType.toUpperCase()})</th>
            <th className="px-4 py-2 text-right">Total Price ({currencyType.toUpperCase()})</th>
          </tr>
        </thead>
        <tbody>
          {items?.map((item) => (
            <tr key={item.id} className="border-b last:border-0">
              <td className="px-4 py-2">{item.name}</td>
              <td className="px-4 py-2">{item.description}</td>
              <td className="px-4 py-2 text-right">{item.quantity}</td>
              <td className="px-4 py-2 text-right">
                {formatNumber(item.unit_price)}
              </td>
              <td className="px-4 py-2 text-right">
                {formatNumber(item.total_price)}
              </td>
            </tr>
          ))}
          <tr className="font-semibold">
            <td colSpan={4} className="px-4 py-2 text-right">Subtotal:</td>
            <td className="px-4 py-2 text-right">
              {formatNumber(subtotal)} {currencyType.toUpperCase()}
            </td>
          </tr>
          <tr className="font-semibold">
            <td colSpan={4} className="px-4 py-2 text-right">Discount:</td>
            <td className="px-4 py-2 text-right">
              {formatNumber(discount)} {currencyType.toUpperCase()}
            </td>
          </tr>
          <tr className="font-semibold">
            <td colSpan={4} className="px-4 py-2 text-right">Total:</td>
            <td className="px-4 py-2 text-right">
              {formatNumber(totalAmount)} {currencyType.toUpperCase()}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}