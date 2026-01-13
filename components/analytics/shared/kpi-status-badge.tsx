import type { KPIResultStatus } from "@/app/generated/prisma/enums";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, XCircle } from "lucide-react";

interface KPIStatusBadgeProps {
  status: KPIResultStatus;
  className?: string;
}

export function KPIStatusBadge({ status, className }: KPIStatusBadgeProps) {
  const statusConfig = {
    PASSED: {
      label: "Passed",
      icon: CheckCircle2,
      className:
        "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400",
    },
    FAILED: {
      label: "Failed",
      icon: XCircle,
      className: "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400",
    },
    PENDING: {
      label: "Pending",
      icon: Clock,
      className:
        "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400",
    },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Badge
      variant="outline"
      className={`${config.className} border-0 ${className ?? ""}`}
    >
      <Icon className="h-3 w-3 mr-1" />
      {config.label}
    </Badge>
  );
}
