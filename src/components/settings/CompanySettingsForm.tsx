import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Textarea } from "@/components/ui/textarea";
import { Image } from "lucide-react";

export function CompanySettingsForm() {
  const [isUploading, setIsUploading] = useState(false);
  const [companyAddress, setCompanyAddress] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadCompanySettings();
  }, []);

  const loadCompanySettings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from('company_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      if (data) {
        setCompanyAddress(data.company_address || "");
        setLogoUrl(data.logo_url || "");
      }
    } catch (error: any) {
      console.error("Error loading company settings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}-${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('company-logos')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('company-logos')
        .getPublicUrl(filePath);

      const { error: upsertError } = await supabase
        .from('company_settings')
        .upsert({
          user_id: user.id,
          logo_url: publicUrl,
          company_address: companyAddress,
        }, {
          onConflict: 'user_id'
        });

      if (upsertError) throw upsertError;

      setLogoUrl(publicUrl);
      toast({
        title: "Success",
        description: "Company logo updated successfully",
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
          logo_url: logoUrl,
        }, {
          onConflict: 'user_id'
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

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <div>
            <Label htmlFor="logo" className="text-base">Company Logo</Label>
            <div className="mt-2 flex items-center gap-4">
              <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-border">
                {logoUrl ? (
                  <img 
                    src={logoUrl} 
                    alt="Company logo" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-muted">
                    <Image className="w-8 h-8 text-muted-foreground" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <Input
                  id="logo"
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  disabled={isUploading}
                  className="form-input"
                />
                <p className="text-sm text-muted-foreground mt-2">
                  Recommended size: 200x200px
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="address" className="text-base">Company Address</Label>
            <Textarea
              id="address"
              value={companyAddress}
              onChange={(e) => setCompanyAddress(e.target.value)}
              placeholder="Enter your company address"
              className="form-input min-h-[100px] mt-2"
            />
          </div>
          <Button
            onClick={handleAddressUpdate}
            className="w-full sm:w-auto"
          >
            Update Address
          </Button>
        </div>
      </div>
    </div>
  );
}