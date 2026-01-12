"use client";

import { Card } from "@/components/ui/card";
import { ChevronDown, ChevronUp, Loader2, LucideIcon } from "lucide-react";
import { ReactNode, useEffect, useState } from "react";

interface ExpandableKpiCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  iconColor: string;
  iconBgColor: string;
  children: ReactNode;
  onExpand?: () => void;
  loading?: boolean;
  error?: string | null;
}

export function ExpandableKpiCard({
  title,
  description,
  icon: Icon,
  iconColor,
  iconBgColor,
  children,
  onExpand,
  loading = false,
  error = null,
}: ExpandableKpiCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (isExpanded && onExpand) {
      onExpand();
    }
  }, [isExpanded, onExpand]);

  return (
    <Card className="p-6 shadow-soft transition-all duration-200">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between text-left"
      >
        <div className="flex items-center gap-3">
          <div className={`h-10 w-10 rounded-lg ${iconBgColor} flex items-center justify-center`}>
            <Icon className={`h-5 w-5 ${iconColor}`} />
          </div>
          <div>
            <h2 className="font-heading text-xl font-semibold">{title}</h2>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </div>
        {isExpanded ? (
          <ChevronUp className="h-5 w-5 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-5 w-5 text-muted-foreground" />
        )}
      </button>

      {isExpanded && (
        <div className="mt-6 space-y-6 animate-in fade-in duration-200">
          {loading && (
            <div className="bg-muted/50 rounded-lg p-8 text-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">Loading data...</p>
            </div>
          )}

          {error && (
            <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {!loading && !error && children}
        </div>
      )}
    </Card>
  );
}
