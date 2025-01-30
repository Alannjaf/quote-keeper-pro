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

  return (
    <div className="app-layout">
      <nav className="top-nav">
        <div className="nav-container">
          <div className="flex items-center gap-6">
            <h1 className="text-xl font-semibold gradient-text">
              Quotation App
            </h1>
            <div className="nav-menu">
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
          <div className="flex items-center gap-4">
            <ModeToggle />
            <UserAvatar />
          </div>
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