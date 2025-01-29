import { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import QuotationsIndex from "./pages/quotations/Index";
import NewQuotation from "./pages/quotations/New";
import UsersIndex from "./pages/users/Index";
import SettingsIndex from "./pages/settings/Index";

const queryClient = new QueryClient();

const App = () => {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return null; // Or a loading spinner
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route
              path="/"
              element={
                session ? (
                  <Index />
                ) : (
                  <Navigate to="/auth" replace />
                )
              }
            />
            <Route
              path="/auth"
              element={
                !session ? (
                  <Auth />
                ) : (
                  <Navigate to="/" replace />
                )
              }
            />
            <Route
              path="/quotations"
              element={
                session ? (
                  <QuotationsIndex />
                ) : (
                  <Navigate to="/auth" replace />
                )
              }
            />
            <Route
              path="/quotations/new"
              element={
                session ? (
                  <NewQuotation />
                ) : (
                  <Navigate to="/auth" replace />
                )
              }
            />
            <Route
              path="/users"
              element={
                session ? (
                  <UsersIndex />
                ) : (
                  <Navigate to="/auth" replace />
                )
              }
            />
            <Route
              path="/settings"
              element={
                session ? (
                  <SettingsIndex />
                ) : (
                  <Navigate to="/auth" replace />
                )
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;