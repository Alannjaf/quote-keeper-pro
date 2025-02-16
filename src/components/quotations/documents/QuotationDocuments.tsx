
import { DocumentListItem } from "./DocumentListItem";
import { UploadButton } from "./UploadButton";
import { useDocuments } from "./useDocuments";

interface QuotationDocumentsProps {
  quotationId: string;
}

export function QuotationDocuments({ quotationId }: QuotationDocumentsProps) {
  const {
    documents,
    isUploading,
    handleFileUpload,
    handleDownload,
    handleDelete
  } = useDocuments(quotationId);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Documents</h2>
        <UploadButton
          isUploading={isUploading}
          onChange={handleFileUpload}
        />
      </div>

      <div className="border rounded-lg divide-y">
        {documents.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            No documents uploaded yet
          </div>
        ) : (
          documents.map(doc => (
            <DocumentListItem
              key={doc.id}
              id={doc.id}
              fileName={doc.file_name}
              size={doc.size}
              createdAt={doc.created_at}
              onDownload={() => handleDownload(doc.file_path, doc.file_name)}
              onDelete={() => handleDelete(doc.id, doc.file_path)}
            />
          ))
        )}
      </div>
    </div>
  );
}
