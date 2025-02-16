
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Document {
  id: string;
  file_name: string;
  file_path: string;
  type: 'quotation' | 'invoice';
  content_type: string;
  size: number;
  created_at: string;
}

export function useDocuments(quotationId: string) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const fetchDocuments = async () => {
    const { data, error } = await supabase
      .from('vendor_documents')
      .select('*')
      .eq('quotation_id', quotationId)
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to load documents",
        variant: "destructive"
      });
      return;
    }
    setDocuments(data);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    setIsUploading(true);
    const user = await supabase.auth.getUser();

    try {
      for (const file of Array.from(files)) {
        const fileExt = file.name.split('.').pop();
        const filePath = `${quotationId}/${crypto.randomUUID()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('vendor-documents')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { error: dbError } = await supabase
          .from('vendor_documents')
          .insert({
            quotation_id: quotationId,
            file_name: file.name,
            file_path: filePath,
            type: file.name.toLowerCase().includes('invoice') ? 'invoice' : 'quotation',
            size: file.size,
            content_type: file.type,
            uploaded_by: user.data.user?.id
          });

        if (dbError) throw dbError;
      }
      toast({
        title: "Success",
        description: "Documents uploaded successfully"
      });
      fetchDocuments();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
      event.target.value = '';
    }
  };

  const handleDownload = async (filePath: string, fileName: string) => {
    try {
      const { data } = supabase.storage
        .from('vendor-documents')
        .getPublicUrl(filePath);

      const link = document.createElement('a');
      link.href = data.publicUrl;
      link.download = fileName;
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error: any) {
      console.error('Download error:', error);
      toast({
        title: "Error",
        description: "Failed to download file",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (id: string, filePath: string) => {
    try {
      const { error: storageError } = await supabase.storage
        .from('vendor-documents')
        .remove([filePath]);

      if (storageError) throw storageError;

      const { error: dbError } = await supabase
        .from('vendor_documents')
        .delete()
        .eq('id', id);

      if (dbError) throw dbError;

      toast({
        title: "Success",
        description: "Document deleted successfully"
      });
      fetchDocuments();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [quotationId]);

  return {
    documents,
    isUploading,
    handleFileUpload,
    handleDownload,
    handleDelete
  };
}
