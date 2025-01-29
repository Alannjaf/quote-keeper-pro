import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export function LogoutButton() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
      await supabase.auth.signOut();

      toast({
        title: "Signed out successfully",
        description: "You have been logged out of your account.",
      });

      navigate("/auth");
    } catch (error: any) {
      console.error("Logout error:", error);
      toast({
        title: "Error signing out",
        description: error.message || "An error occurred while signing out",
        variant: "destructive",
      });
      navigate("/auth");
    }
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton asChild>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full"
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </button>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}