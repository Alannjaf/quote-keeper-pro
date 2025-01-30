import { UserAvatar } from "./UserAvatar";
import { ModeToggle } from "./ModeToggle";
import { Link } from "react-router-dom";
import { FileText, Settings, Users } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');
      
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (error) throw error;
      return profile;
    },
  });

  const { data: companySettings } = useQuery({
    queryKey: ['companySettings'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');
      
      const { data, error } = await supabase
        .from('company_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
  });

  return (
    <div className="app-layout">
      <nav className="top-nav">
        <div className="nav-container px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="flex items-center gap-4">
              {companySettings?.logo_url ? (
                <img 
                  src={companySettings.logo_url} 
                  alt="Company Logo" 
                  className="h-8 w-auto"
                />
              ) : (
                <h1 className="text-xl font-semibold gradient-text">
                  Quotation App
                </h1>
              )}
            </div>
            <div className="hidden sm:flex nav-menu">
              <Link to="/quotations" className="nav-link">
                <FileText className="h-4 w-4 mr-2 inline-block" />
                Quotations
              </Link>
              <Link to="/settings" className="nav-link">
                <Settings className="h-4 w-4 mr-2 inline-block" />
                Settings
              </Link>
              {currentUser?.role === 'admin' && (
                <Link to="/users" className="nav-link">
                  <Users className="h-4 w-4 mr-2 inline-block" />
                  Users
                </Link>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <ModeToggle />
            <UserAvatar />
          </div>
        </div>
        <div className="sm:hidden overflow-x-auto flex nav-menu px-4 border-t border-border/50 py-2">
          <Link to="/quotations" className="nav-link whitespace-nowrap">
            <FileText className="h-4 w-4 mr-2 inline-block" />
            Quotations
          </Link>
          <Link to="/settings" className="nav-link whitespace-nowrap">
            <Settings className="h-4 w-4 mr-2 inline-block" />
            Settings
          </Link>
          {currentUser?.role === 'admin' && (
            <Link to="/users" className="nav-link whitespace-nowrap">
              <Users className="h-4 w-4 mr-2 inline-block" />
              Users
            </Link>
          )}
        </div>
      </nav>
      <main className="app-main">
        <div className="app-container">
          {children}
        </div>
      </main>
    </div>
  );
}