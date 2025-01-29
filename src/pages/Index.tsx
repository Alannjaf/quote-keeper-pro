import { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Users, DollarSign, Activity } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

async function fetchDashboardStats() {
  const { data: quotations, error: quotationsError } = await supabase
    .from("quotations")
    .select("*");

  const { data: vendors, error: vendorsError } = await supabase
    .from("vendors")
    .select("*");

  if (quotationsError || vendorsError) {
    throw new Error("Failed to fetch dashboard stats");
  }

  const totalValue = quotations?.reduce((sum, quote) => sum + Number(quote.vendor_cost), 0) || 0;
  const approvedQuotes = quotations?.filter(q => q.status === 'approved').length || 0;
  const totalQuotes = quotations?.length || 0;
  const conversionRate = totalQuotes ? ((approvedQuotes / totalQuotes) * 100).toFixed(1) : 0;

  return {
    totalQuotations: quotations?.length || 0,
    activeUsers: vendors?.length || 0,
    totalValue: totalValue,
    conversionRate: conversionRate
  };
}

export default function Index() {
  const navigate = useNavigate();
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: fetchDashboardStats
  });

  const dashboardStats = [
    {
      title: "Total Quotations",
      value: isLoading ? "Loading..." : stats?.totalQuotations.toString(),
      icon: FileText,
      description: "Active quotations in the system",
    },
    {
      title: "Active Vendors",
      value: isLoading ? "Loading..." : stats?.activeUsers.toString(),
      icon: Users,
      description: "Vendors in the system",
    },
    {
      title: "Total Value",
      value: isLoading ? "Loading..." : `$${stats?.totalValue.toLocaleString()}`,
      icon: DollarSign,
      description: "Combined value of all quotations",
    },
    {
      title: "Approval Rate",
      value: isLoading ? "Loading..." : `${stats?.conversionRate}%`,
      icon: Activity,
      description: "Quotations approved vs total",
    },
  ];

  const handleCreateQuotation = () => {
    navigate("/quotations/new");
  };

  return (
    <AppLayout>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome to your quotation management system
          </p>
        </div>
        <Button onClick={handleCreateQuotation}>Create New Quotation</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {dashboardStats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </AppLayout>
  );
}