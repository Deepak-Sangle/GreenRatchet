"use client";

import { Card } from "@/components/ui/card";
import { ChevronDown, ChevronUp, Cpu } from "lucide-react";
import { useState } from "react";

export function AiComputeHoursKpi() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card className="p-6 shadow-soft transition-all duration-200">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between text-left"
      >
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
            <Cpu className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h2 className="font-heading text-xl font-semibold">
              AI Compute Hours
            </h2>
            <p className="text-sm text-muted-foreground">
              Monitor AI/ML workload efficiency and resource usage
            </p>
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
          <div>
            <p className="text-muted-foreground leading-relaxed">
              AI Compute Hours measures the total computational resources
              consumed by artificial intelligence and machine learning
              workloads, including GPU hours, TPU hours, and specialized AI
              accelerator usage. Since AI workloads are among the most
              energy-intensive cloud operations with direct correlation to both
              cost and carbon emissions, tracking this metric helps you identify
              inefficient AI models and training processes, optimize resource
              allocation, benchmark efficiency against industry standards, and
              demonstrate responsible AI practices. This KPI is increasingly
              important given growing regulatory focus on AI's environmental
              impact and provides opportunities to reduce operational costs
              while maintaining model performance.
            </p>
          </div>

          <div className="pt-4 border-t">
            <h3 className="font-heading text-lg font-semibold mb-4">
              Performance Analytics
            </h3>
            <div className="bg-muted/50 rounded-lg p-8 text-center">
              <p className="text-muted-foreground">
                Graph components will be integrated here
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Compute trends, efficiency metrics, workload distribution charts
              </p>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
