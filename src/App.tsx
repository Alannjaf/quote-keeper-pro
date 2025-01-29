import { useEffect, useState } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { Toaster } from "@/components/ui/toaster";
import { createRoutes } from "@/router/routes";
import { useQueryClient } from "@tanstack/react-query";
import "./App.css";

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (!session) {
        // Clear all queries when user logs out
        queryClient.clear();
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) {
        // Clear all queries when user logs out
        queryClient.clear();
      }
    });

    return () => subscription.unsubscribe();
  }, [queryClient]);

  const router = createBrowserRouter(createRoutes(session));

  return (
    <>
      <RouterProvider router={router} />
      <Toaster />
    </>
  );
}