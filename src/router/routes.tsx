import { Navigate, RouteObject } from "react-router-dom";
import { Session } from "@supabase/supabase-js";
import Auth from "@/pages/Auth";
import NotFound from "@/pages/NotFound";
import QuotationsIndex from "@/pages/quotations/Index";
import NewQuotation from "@/pages/quotations/New";
import EditQuotation from "@/pages/quotations/Edit";
import ViewQuotation from "@/pages/quotations/View";
import UsersIndex from "@/pages/users/Index";
import SettingsIndex from "@/pages/settings/Index";

export const createRoutes = (session: Session | null): RouteObject[] => [
  {
    path: "/",
    element: session ? <Navigate to="/quotations" replace /> : <Navigate to="/auth" replace />,
  },
  {
    path: "/auth",
    element: session ? <Navigate to="/" replace /> : <Auth />,
  },
  {
    path: "/quotations",
    element: session ? <QuotationsIndex /> : <Navigate to="/auth" replace />,
  },
  {
    path: "/quotations/new",
    element: session ? <NewQuotation /> : <Navigate to="/auth" replace />,
  },
  {
    path: "/quotations/:id/edit",
    element: session ? <EditQuotation /> : <Navigate to="/auth" replace />,
  },
  {
    path: "/quotations/:id",
    element: session ? <ViewQuotation /> : <Navigate to="/auth" replace />,
  },
  {
    path: "/users",
    element: session ? <UsersIndex /> : <Navigate to="/auth" replace />,
  },
  {
    path: "/settings",
    element: session ? <SettingsIndex /> : <Navigate to="/auth" replace />,
  },
  {
    path: "*",
    element: <NotFound />,
  },
];