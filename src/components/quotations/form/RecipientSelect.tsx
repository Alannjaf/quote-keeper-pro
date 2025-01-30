import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

interface RecipientSelectProps {
  recipient: string;
  setRecipient: (value: string) => void;
  recipients?: string[];
}

export function RecipientSelect({
  recipient,
  setRecipient,
  recipients = [],
}: RecipientSelectProps) {
  const { toast } = useToast();
  const [newRecipient, setNewRecipient] = useState("");
  const [isAddingRecipient, setIsAddingRecipient] = useState(false);
  const queryClient = useQueryClient();

  const handleAddRecipient = async (e?: React.MouseEvent) => {
    // Prevent any form submission
    e?.preventDefault();
    
    if (!newRecipient.trim()) {
      toast({
        title: "Error",
        description: "Recipient name cannot be empty",
        variant: "destructive",
      });
      return;
    }

    setRecipient(newRecipient.trim());
    setNewRecipient("");
    setIsAddingRecipient(false);

    // Invalidate the recipients query to trigger a refetch
    await queryClient.invalidateQueries({ queryKey: ['recipients'] });

    toast({
      title: "Success",
      description: "New recipient added successfully",
    });
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="recipient">To</Label>
      {isAddingRecipient ? (
        <div className="flex gap-2">
          <Input
            value={newRecipient}
            onChange={(e) => setNewRecipient(e.target.value)}
            placeholder="Enter new recipient"
            className="flex-1"
            // Prevent form submission on enter
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddRecipient();
              }
            }}
          />
          <Button 
            onClick={handleAddRecipient} 
            className="shrink-0"
            type="button" // Prevent form submission
          >
            Add
          </Button>
          <Button
            variant="outline"
            onClick={(e) => {
              e.preventDefault();
              setIsAddingRecipient(false);
            }}
            className="shrink-0"
            type="button" // Prevent form submission
          >
            Cancel
          </Button>
        </div>
      ) : (
        <div className="flex gap-2">
          <Select value={recipient} onValueChange={setRecipient}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Select recipient..." />
            </SelectTrigger>
            <SelectContent>
              {recipients?.map((r) => (
                <SelectItem key={r} value={r}>
                  {r}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            onClick={(e) => {
              e.preventDefault();
              setIsAddingRecipient(true);
            }}
            className="shrink-0"
            type="button" // Prevent form submission
          >
            New
          </Button>
        </div>
      )}
    </div>
  );
}