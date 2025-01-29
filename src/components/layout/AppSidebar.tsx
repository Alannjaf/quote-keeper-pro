import {
  FileText,
  Settings,
  Users,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
} from "@/components/ui/sidebar";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MenuItems } from "./sidebar/MenuItems";
import { LogoutButton } from "./sidebar/LogoutButton";

const mainMenuItems = [
  {
    title: "Quotations",
    icon: FileText,
    url: "/quotations",
  },
  {
    title: "Settings",
    icon: Settings,
    url: "/settings",
  },
];

const adminMenuItems = [
  {
    title: "Users",
    icon: Users,
    url: "/users",
  },
];

export function AppSidebar() {
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
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <MenuItems items={mainMenuItems} label="Main Menu" />
          </SidebarGroupContent>
        </SidebarGroup>

        {currentUser?.role === 'admin' && (
          <SidebarGroup>
            <SidebarGroupLabel>Admin</SidebarGroupLabel>
            <SidebarGroupContent>
              <MenuItems items={adminMenuItems} label="Admin Menu" />
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <LogoutButton />
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}