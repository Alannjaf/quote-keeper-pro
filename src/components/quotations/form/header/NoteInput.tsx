import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface NoteInputProps {
  note: string;
  setNote: (value: string) => void;
}

export function NoteInput({ note, setNote }: NoteInputProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="note">Note</Label>
      <Textarea
        id="note"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Add a note to this quotation"
        className="h-24"
      />
    </div>
  );
}