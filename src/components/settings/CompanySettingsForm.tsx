import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Textarea } from "@/components/ui/textarea";

export function CompanySettingsForm() {
  const [isUploading, setIsUploading] = useState(false);
  const [companyAddress, setCompanyAddress] = useState("");
  const { toast } = useToast();

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Upload logo to storage
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}-${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('company-logos')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('company-logos')
        .getPublicUrl(filePath);

      // Update or create company settings
      const { error: upsertError } = await supabase
        .from('company_settings')
        .upsert({
          user_id: user.id,
          logo_url: publicUrl,
          company_address: companyAddress,
        });

      if (upsertError) throw upsertError;

      toast({
        title: "Success",
        description: "Company settings updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddressUpdate = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from('company_settings')
        .upsert({
          user_id: user.id,
          company_address: companyAddress,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Company address updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="logo">Company Logo</Label>
        <Input
          id="logo"
          type="file"
          accept="image/*"
          onChange={handleLogoUpload}
          disabled={isUploading}
        />
      </div>
      <div>
        <Label htmlFor="address">Company Address</Label>
        <Textarea
          id="address"
          value={companyAddress}
          onChange={(e) => setCompanyAddress(e.target.value)}
          placeholder="Enter your company address"
          className="h-24"
        />
        <Button
          onClick={handleAddressUpdate}
          className="mt-2"
        >
          Update Address
        </Button>
      </div>
    </div>
  );
}