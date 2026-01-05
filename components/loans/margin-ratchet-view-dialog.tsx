"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { formatBps, formatDate } from "@/lib/utils";
import { Eye } from "lucide-react";
import { useState } from "react";

interface MarginRatchetViewDialogProps {
  ratchet: {
    id: string;
    stepUpBps: number;
    stepDownBps: number;
    maxAdjustmentBps: number;
    createdAt: Date;
    updatedAt: Date;
    kpi: {
      id: string;
      name: string;
      unit: string;
      targetValue: number;
    };
  };
}

export function MarginRatchetViewDialog({
  ratchet,
}: MarginRatchetViewDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Eye className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Margin Ratchet Details</DialogTitle>
          <DialogDescription>
            View the complete configuration for this margin ratchet.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Linked KPI Section */}
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Linked KPI
            </h4>
            <div className="rounded-lg border p-3 bg-muted/30">
              <p className="font-medium">{ratchet.kpi.name}</p>
              <p className="text-sm text-muted-foreground">
                Target: {ratchet.kpi.targetValue} {ratchet.kpi.unit}
              </p>
            </div>
          </div>

          <Separator />

          {/* Margin Adjustments Section */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Margin Adjustments
            </h4>
            <div className="grid gap-3 grid-cols-3">
              <div className="text-center p-3 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900">
                <p className="text-xs text-muted-foreground mb-1">Step Up</p>
                <p className="text-lg font-bold text-green-600 dark:text-green-400">
                  {formatBps(ratchet.stepUpBps)}
                </p>
                <p className="text-xs text-muted-foreground">When target met</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900">
                <p className="text-xs text-muted-foreground mb-1">Step Down</p>
                <p className="text-lg font-bold text-red-600 dark:text-red-400">
                  {formatBps(-1 * ratchet.stepDownBps)}
                </p>
                <p className="text-xs text-muted-foreground">
                  When target missed
                </p>
              </div>
              <div className="text-center p-3 rounded-lg bg-slate-50 dark:bg-slate-950/30 border border-slate-200 dark:border-slate-800">
                <p className="text-xs text-muted-foreground mb-1">
                  Max Adjustment
                </p>
                <p className="text-lg font-bold text-slate-600 dark:text-slate-400">
                  ±{ratchet.maxAdjustmentBps} bps
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Timestamps */}
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Timestamps
            </h4>
            <div className="grid gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Created</span>
                <span>{formatDate(ratchet.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Last Updated</span>
                <span>{formatDate(ratchet.updatedAt)}</span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
