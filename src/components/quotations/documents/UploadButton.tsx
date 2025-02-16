
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

interface UploadButtonProps {
  isUploading: boolean;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export function UploadButton({ isUploading, onChange }: UploadButtonProps) {
  return (
    <div className="relative">
      <input
        type="file"
        multiple
        onChange={onChange}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
      />
      <Button disabled={isUploading}>
        <Upload className="w-4 h-4 mr-2" />
        {isUploading ? 'Uploading...' : 'Upload Files'}
      </Button>
    </div>
  );
}
