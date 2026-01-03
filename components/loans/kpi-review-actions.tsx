"use client";

import { useState } from "react";
import { updateKPIStatus } from "@/app/actions/loans";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";

interface KPIReviewActionsProps {
  kpiId: string;
}

export function KPIReviewActions({ kpiId }: KPIReviewActionsProps) {
  const [loading, setLoading] = useState(false);

  async function handleAccept() {
    setLoading(true);
    await updateKPIStatus(kpiId, { status: "ACCEPTED" });
    setLoading(false);
  }

  async function handleReject() {
    setLoading(true);
    await updateKPIStatus(kpiId, { status: "REJECTED" });
    setLoading(false);
  }

  return (
    <div className="flex gap-2">
      <Button
        size="sm"
        variant="outline"
        className="text-green-600 border-green-600 hover:bg-green-50"
        onClick={handleAccept}
        disabled={loading}
      >
        <Check className="mr-1 h-4 w-4" />
        Accept
      </Button>
      <Button
        size="sm"
        variant="outline"
        className="text-red-600 border-red-600 hover:bg-red-50"
        onClick={handleReject}
        disabled={loading}
      >
        <X className="mr-1 h-4 w-4" />
        Reject
      </Button>
    </div>
  );
}
