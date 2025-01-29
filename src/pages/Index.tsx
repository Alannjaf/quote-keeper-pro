import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Users, DollarSign, Activity } from "lucide-react";

const stats = [
  {
    title: "Total Quotations",
    value: "0",
    icon: FileText,
    description: "Active quotations in the system",
  },
  {
    title: "Active Users",
    value: "0",
    icon: Users,
    description: "Users with access to the system",
  },
  {
    title: "Total Value",
    value: "$0",
    icon: DollarSign,
    description: "Combined value of all quotations",
  },
  {
    title: "Conversion Rate",
    value: "0%",
    icon: Activity,
    description: "Quotations converted to invoices",
  },
];

export default function Index() {
  return (
    <AppLayout>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome to your quotation management system
          </p>
        </div>
        <Button>Create New Quotation</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
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