"use client";

import { useState } from "react";
import { triggerKPICalculation } from "@/app/actions/kpi-calculation";
import { Button } from "@/components/ui/button";
import { Calculator } from "lucide-react";

interface CalculateKPIsButtonProps {
  loanId: string;
}

export function CalculateKPIsButton({ loanId }: CalculateKPIsButtonProps) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleCalculate() {
    setLoading(true);
    setMessage(null);

    const result = await triggerKPICalculation(loanId);

    if (result?.error) {
      setMessage(`Error: ${result.error}`);
    } else if (result?.success) {
      setMessage(
        `Success! Calculated ${result.resultsCreated} KPI${
          result.resultsCreated !== 1 ? "s" : ""
        }`
      );
    }

    setLoading(false);
  }

  return (
    <div className="space-y-2">
      <Button onClick={handleCalculate} disabled={loading} variant="outline">
        <Calculator className="mr-2 h-4 w-4" />
        {loading ? "Calculating..." : "Calculate KPIs"}
      </Button>
      {message && (
        <p
          className={`text-sm ${
            message.startsWith("Error") ? "text-destructive" : "text-green-600"
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
}
