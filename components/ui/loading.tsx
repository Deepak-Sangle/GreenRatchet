import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface LoadingProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function Loading({ size = "md", className }: LoadingProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  };

  return (
    <Loader2
      className={cn(
        "animate-spin text-muted-foreground",
        sizeClasses[size],
        className
      )}
    />
  );
}

interface LoadingCardProps {
  title?: string;
  className?: string;
}

export function LoadingCard({
  title = "Loading...",
  className,
}: LoadingCardProps) {
  return (
    <div className={cn("bg-muted/50 rounded-lg p-8 text-center", className)}>
      <Loading size="lg" className="mx-auto mb-3" />
      <p className="text-sm text-muted-foreground">{title}</p>
    </div>
  );
}
