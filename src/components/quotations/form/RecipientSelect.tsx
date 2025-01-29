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

  const handleAddRecipient = () => {
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
          />
          <Button onClick={handleAddRecipient} className="shrink-0">
            Add
          </Button>
          <Button
            variant="outline"
            onClick={() => setIsAddingRecipient(false)}
            className="shrink-0"
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
            onClick={() => setIsAddingRecipient(true)}
            className="shrink-0"
          >
            New
          </Button>
        </div>
      )}
    </div>
  );
}