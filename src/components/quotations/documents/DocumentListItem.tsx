
import { format } from "date-fns";
import { File, Trash2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DocumentListItemProps {
  id: string;
  fileName: string;
  size: number;
  createdAt: string;
  onDownload: () => void;
  onDelete: () => void;
}

export function DocumentListItem({
  fileName,
  size,
  createdAt,
  onDownload,
  onDelete,
}: DocumentListItemProps) {
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="p-4 flex items-center justify-between bg-gray-900 hover:bg-gray-800">
      <div className="flex items-center space-x-3">
        <File className="w-5 h-5 text-gray-400" />
        <div>
          <p className="font-medium">{fileName}</p>
          <p className="text-sm text-gray-500">
            {formatFileSize(size)} • {format(new Date(createdAt), 'MMM d, yyyy')}
          </p>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onDownload}
        >
          <Download className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onDelete}
        >
          <Trash2 className="w-4 h-4 text-red-500" />
        </Button>
      </div>
    </div>
  );
}
