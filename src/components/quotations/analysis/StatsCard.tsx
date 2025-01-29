import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  description: string;
}

export function StatsCard({ title, value, icon: Icon, description }: StatsCardProps) {
  return (
    <Card className="hover-card">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 card-gradient rounded-t-lg">
        <CardTitle className="text-sm font-medium text-white">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-white" />
      </CardHeader>
      <CardContent className="pt-6">
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">
          {description}
        </p>
      </CardContent>
    </Card>
  );
}