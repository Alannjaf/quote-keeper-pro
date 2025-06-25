import { useEffect, useState, useMemo } from "react";
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
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state change:', event, !!session);
      setSession(session);
      // Only clear cache on sign out to preserve data on session refresh
      if (event === 'SIGNED_OUT') {
        console.log('Clearing query cache on sign out');
        queryClient.clear();
      }
    });

    return () => subscription.unsubscribe();
  }, [queryClient]);

  // Memoize router to prevent recreation on every render
  const router = useMemo(() => {
    return createBrowserRouter(createRoutes(session));
  }, [session]);

  // Show loading state
  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <>
      <RouterProvider router={router} />
      <Toaster />
    </>
  );
}