import { useEffect, useState } from "react";
import { createBrowserRouter, RouterProvider, useNavigate } from "react-router-dom";
import { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { Toaster } from "@/components/ui/toaster";
import { createRoutes } from "@/router/routes";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import "./App.css";

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isApproved, setIsApproved] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  useEffect(() => {
    // Initial session check
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      
      if (session) {
        // Check user approval status
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('is_approved')
          .eq('id', session.user.id)
          .single();
        
        if (error) {
          console.error('Error fetching profile:', error);
          return;
        }

        setIsApproved(profile?.is_approved || false);
        
        if (!profile?.is_approved) {
          toast({
            title: "Account Pending Approval",
            description: "Your account is pending approval from an administrator.",
            duration: 5000,
          });
          // Sign out unapproved users
          await supabase.auth.signOut();
          setSession(null);
        }
      } else {
        queryClient.clear();
      }
      setIsLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      
      if (session) {
        // Check user approval status on auth state change
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('is_approved')
          .eq('id', session.user.id)
          .single();
        
        if (error) {
          console.error('Error fetching profile:', error);
          return;
        }

        setIsApproved(profile?.is_approved || false);
        
        if (!profile?.is_approved) {
          toast({
            title: "Account Pending Approval",
            description: "Your account is pending approval from an administrator.",
            duration: 5000,
          });
          // Sign out unapproved users
          await supabase.auth.signOut();
          setSession(null);
        }
      } else {
        queryClient.clear();
      }
    });

    return () => subscription.unsubscribe();
  }, [queryClient, toast]);

  // Don't render anything while checking the session
  if (isLoading) {
    return null;
  }

  // Create routes regardless of approval status
  const router = createBrowserRouter(createRoutes(session));

  return (
    <>
      <RouterProvider router={router} />
      <Toaster />
    </>
  );
}