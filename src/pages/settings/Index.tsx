import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ProfileSettingsForm } from "@/components/settings/ProfileSettingsForm";
import { ExchangeRateSettings } from "@/components/settings/ExchangeRateSettings";
import { CompanySettingsForm } from "@/components/settings/CompanySettingsForm";

export default function SettingsIndex() {
  const { data: profile, isLoading } = useQuery({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
          <div className="glass-card p-8 rounded-lg w-full max-w-4xl mx-auto">
            <div className="animate-pulse">Loading...</div>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="section-header mb-8">
          <h1 className="section-title">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences
          </p>
        </div>

        <div className="space-y-8">
          <Card className="glass-card hover-card">
            <CardHeader className="bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 rounded-t-lg">
              <h2 className="text-xl font-semibold text-foreground">Profile Settings</h2>
            </CardHeader>
            <CardContent className="p-6">
              <ProfileSettingsForm profile={profile} />
            </CardContent>
          </Card>

          <Card className="glass-card hover-card">
            <CardHeader className="bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 rounded-t-lg">
              <h2 className="text-xl font-semibold text-foreground">Company Settings</h2>
            </CardHeader>
            <CardContent className="p-6">
              <CompanySettingsForm />
            </CardContent>
          </Card>

          <Card className="glass-card hover-card">
            <CardHeader className="bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 rounded-t-lg">
              <h2 className="text-xl font-semibold text-foreground">Exchange Rate Settings</h2>
            </CardHeader>
            <CardContent className="p-6">
              <ExchangeRateSettings />
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}