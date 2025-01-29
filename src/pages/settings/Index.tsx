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
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <div className="glass-card p-8 rounded-lg w-full">
            <div className="animate-pulse">Loading...</div>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="section-header mb-8">
        <h1 className="section-title">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="grid gap-8">
        <Card className="glass-card hover-card">
          <CardHeader className="card-gradient rounded-t-lg">
            <h2 className="text-xl font-semibold text-white">Profile Settings</h2>
          </CardHeader>
          <CardContent className="p-6">
            <ProfileSettingsForm profile={profile} />
          </CardContent>
        </Card>

        <Card className="glass-card hover-card">
          <CardHeader className="card-gradient rounded-t-lg">
            <h2 className="text-xl font-semibold text-white">Company Settings</h2>
          </CardHeader>
          <CardContent className="p-6">
            <CompanySettingsForm />
          </CardContent>
        </Card>

        <Card className="glass-card hover-card">
          <CardHeader className="card-gradient rounded-t-lg">
            <h2 className="text-xl font-semibold text-white">Exchange Rate Settings</h2>
          </CardHeader>
          <CardContent className="p-6">
            <ExchangeRateSettings />
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}