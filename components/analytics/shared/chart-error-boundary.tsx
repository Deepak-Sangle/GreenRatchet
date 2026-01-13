"use client";

import { Card } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { Component, type ReactNode } from "react";

interface ChartErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ChartErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error boundary for chart components
 * Catches rendering errors and displays a user-friendly fallback
 */
export class ChartErrorBoundary extends Component<
  ChartErrorBoundaryProps,
  ChartErrorBoundaryState
> {
  constructor(props: ChartErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ChartErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Chart rendering error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Card className="p-6">
          <div className="flex items-start gap-3 text-destructive">
            <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-sm mb-1">
                Unable to display chart
              </p>
              <p className="text-xs text-muted-foreground">
                {this.state.error?.message ??
                  "An error occurred while rendering this visualization"}
              </p>
            </div>
          </div>
        </Card>
      );
    }

    return this.props.children;
  }
}
