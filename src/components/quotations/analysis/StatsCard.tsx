import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface StatsCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  description: string;
  isLoading?: boolean;
  valuePrefix?: string;
  valueSuffix?: string;
}

export function StatsCard({ 
  title, 
  value, 
  icon: Icon, 
  description, 
  isLoading,
  valuePrefix,
  valueSuffix 
}: StatsCardProps) {
  // Format the value if it's a percentage (has % suffix)
  const formattedValue = valueSuffix === '%' ? 
    Math.round(parseFloat(value)).toString() : 
    value;

  return (
    <Card className="hover-card">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gradient-to-r from-primary/90 to-primary/70 rounded-t-lg">
        <CardTitle className="text-sm font-medium text-primary-foreground">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-primary-foreground" />
      </CardHeader>
      <CardContent className="pt-6">
        {isLoading ? (
          <Skeleton className="h-8 w-[100px]" />
        ) : (
          <div className="text-2xl font-bold text-foreground">
            {valuePrefix && <span>{valuePrefix} </span>}
            {formattedValue}
            {valueSuffix && <span> {valueSuffix}</span>}
          </div>
        )}
        <p className="text-xs text-muted-foreground">
          {description}
        </p>
      </CardContent>
    </Card>
  );
}