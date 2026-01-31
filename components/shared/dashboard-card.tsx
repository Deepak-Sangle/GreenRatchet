import { cn } from "@/lib/utils";
import { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

interface DashboardItemProps {
  title: string;
  icon?: ReactNode | null;
  contentTitle: string;
  contentBody: string;
  unit?: string;
  highlighted?: boolean;
}

export const DashboardItem = ({
  title,
  icon,
  contentTitle,
  contentBody,
  unit,
  highlighted = false,
}: DashboardItemProps) => {
  return (
    <Card className={cn(highlighted && "border-primary/20 bg-primary/5")}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div
          className={cn("text-2xl font-bold", highlighted && "text-primary")}
        >
          {contentTitle}
          {unit && (
            <span className="text-sm ml-1 font-normal opacity-70">{unit}</span>
          )}
        </div>
        <p className="text-xs text-muted-foreground">{contentBody}</p>
      </CardContent>
    </Card>
  );
};
