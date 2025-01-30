import { useEffect, useState } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
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
  const queryClient = useQueryClient();
  const { toast } = useToast();

  useEffect(() => {
    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsLoading(false);
      
      if (session) {
        // Check user approval status
        supabase
          .from('profiles')
          .select('is_approved')
          .eq('id', session.user.id)
          .single()
          .then(({ data: profile, error }) => {
            if (error) {
              console.error('Error fetching profile:', error);
              queryClient.clear();
              return;
            }

            if (!profile?.is_approved) {
              toast({
                title: "Account Pending Approval",
                description: "Your account is pending approval from an administrator.",
                duration: 5000,
              });
              // Sign out unapproved users
              supabase.auth.signOut().then(() => {
                setSession(null);
                queryClient.clear();
              });
            }
          });
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      queryClient.clear();
      
      if (session) {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('is_approved')
          .eq('id', session.user.id)
          .single();
        
        if (error) {
          console.error('Error fetching profile:', error);
          return;
        }

        if (!profile?.is_approved) {
          toast({
            title: "Account Pending Approval",
            description: "Your account is pending approval from an administrator.",
            duration: 5000,
          });
          // Sign out unapproved users
          await supabase.auth.signOut();
          setSession(null);
          queryClient.clear();
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [queryClient, toast]);

  // Show loading state
  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  // Create routes
  const router = createBrowserRouter(createRoutes(session));

  return (
    <>
      <RouterProvider router={router} />
      <Toaster />
    </>
  );
}