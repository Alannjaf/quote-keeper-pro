import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export function QuotationHeader() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
      <div>
        <h1 className="text-4xl font-bold tracking-tight gradient-text">
          Quotations
        </h1>
        <p className="text-muted-foreground mt-2">
          Manage your quotations here
        </p>
      </div>
      <Button 
        onClick={() => navigate('/quotations/new')}
        className="glass-card hover-card w-full sm:w-auto"
      >
        Create New Quotation
      </Button>
    </div>
  );
}