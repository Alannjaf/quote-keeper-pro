import { format } from "date-fns";
import { QuotationStatusBadge } from "../QuotationStatusBadge";

interface QuotationDetailsProps {
  quotation: any;
  formatNumber: (num: number) => string;
  subtotal: number;
  totalAmount: number;
}

export function QuotationDetails({ 
  quotation, 
  formatNumber,
  subtotal,
  totalAmount 
}: QuotationDetailsProps) {
  return (
    <div className="grid grid-cols-2 gap-8 mb-8">
      <div>
        <h2 className="text-lg font-semibold mb-4">Quotation Details</h2>
        <dl className="space-y-2">
          <div>
            <dt className="text-sm text-muted-foreground">Date</dt>
            <dd>{format(new Date(quotation.date), 'PPP')}</dd>
          </div>
          <div>
            <dt className="text-sm text-muted-foreground">Validity Date</dt>
            <dd>{format(new Date(quotation.validity_date), 'PPP')}</dd>
          </div>
          <div>
            <dt className="text-sm text-muted-foreground">Budget Type</dt>
            <dd className="capitalize">{quotation.budget_type.replace('_', ' ')}</dd>
          </div>
          <div>
            <dt className="text-sm text-muted-foreground">Status</dt>
            <dd><QuotationStatusBadge status={quotation.status} /></dd>
          </div>
          <div>
            <dt className="text-sm text-muted-foreground">Currency</dt>
            <dd className="uppercase">{quotation.currency_type}</dd>
          </div>
          <div>
            <dt className="text-sm text-muted-foreground">Subtotal</dt>
            <dd>{formatNumber(subtotal)} {quotation.currency_type.toUpperCase()}</dd>
          </div>
          <div>
            <dt className="text-sm text-muted-foreground">Discount</dt>
            <dd>{formatNumber(quotation.discount)} {quotation.currency_type.toUpperCase()}</dd>
          </div>
          <div>
            <dt className="text-sm text-muted-foreground">Total Amount</dt>
            <dd>{formatNumber(totalAmount)} {quotation.currency_type.toUpperCase()}</dd>
          </div>
        </dl>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4">Vendor Information</h2>
        <dl className="space-y-2">
          <div>
            <dt className="text-sm text-muted-foreground">Vendor Name</dt>
            <dd>{quotation.vendor?.name || 'N/A'}</dd>
          </div>
          <div>
            <dt className="text-sm text-muted-foreground">Vendor Cost</dt>
            <dd>
              {formatNumber(quotation.vendor_cost)} {quotation.vendor_currency_type.toUpperCase()}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-muted-foreground">To</dt>
            <dd>{quotation.recipient || 'N/A'}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}