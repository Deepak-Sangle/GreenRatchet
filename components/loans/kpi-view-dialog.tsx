"use client";

import { KPI, MarginRatchet } from "@/app/generated/prisma/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import {
  KPI_DIRECTION_LABELS,
  KPI_FREQUENCY_LABELS,
  KPI_STATUS_LABELS,
  KPI_TYPE_LABELS,
} from "@/lib/labels";
import { formatDate, getKPIUnit } from "@/lib/utils";
import { Target, TrendingDown, TrendingUp } from "lucide-react";

export type KPIData = KPI & {
  marginRatchets: MarginRatchet[];
};

interface KPIViewDialogProps {
  kpi: KPIData;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function KPIViewDialog({ kpi, open, onOpenChange }: KPIViewDialogProps) {
  const statusVariant =
    kpi.status === "ACCEPTED"
      ? "success"
      : kpi.status === "REJECTED"
        ? "destructive"
        : kpi.status === "PROPOSED"
          ? "warning"
          : "secondary";

  const unit = getKPIUnit(kpi);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {kpi.name}
            <Badge variant={statusVariant}>
              {KPI_STATUS_LABELS[kpi.status] || kpi.status}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            View the complete configuration for this ESG KPI.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* KPI Overview */}
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Overview
            </h4>
            <div className="grid gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Type</span>
                <Badge variant="outline">
                  {KPI_TYPE_LABELS[kpi.type] || kpi.type}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Unit</span>
                <span className="font-medium">{unit ?? "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Direction</span>
                <span className="flex items-center gap-1 font-medium">
                  {kpi.direction === "LOWER_IS_BETTER" ? (
                    <TrendingDown className="h-4 w-4 text-green-600" />
                  ) : kpi.direction === "HIGHER_IS_BETTER" ? (
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  ) : (
                    <Target className="h-4 w-4 text-blue-600" />
                  )}
                  {KPI_DIRECTION_LABELS[kpi.direction] || kpi.direction}
                </span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Target & Thresholds */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Targets & Thresholds
            </h4>
            <div className="grid gap-3 grid-cols-2">
              <div className="text-center p-3 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900">
                <p className="text-xs text-muted-foreground mb-1">Target</p>
                <p className="text-xl font-bold text-green-600 dark:text-green-400">
                  {kpi.targetValue}
                  {unit && (
                    <span className="ml-2 text-sm font-normal text-muted-foreground">
                      {unit}
                    </span>
                  )}
                </p>
              </div>
              <div className="text-center p-3 rounded-lg bg-slate-50 dark:bg-slate-950/30 border border-slate-200 dark:border-slate-800">
                <p className="text-xs text-muted-foreground mb-1">Baseline</p>
                <p className="text-xl font-bold">
                  {kpi.baselineValue !== null ? kpi.baselineValue : "—"}
                  {unit && kpi.baselineValue !== null && (
                    <span className="ml-2 text-sm font-normal text-muted-foreground">
                      {unit}
                    </span>
                  )}
                </p>
              </div>
            </div>
            {(kpi.thresholdMin !== null || kpi.thresholdMax !== null) && (
              <div className="grid gap-3 grid-cols-2">
                <div className="text-center p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900">
                  <p className="text-xs text-muted-foreground mb-1">
                    Min Threshold
                  </p>
                  <p className="text-lg font-bold text-amber-600 dark:text-amber-400">
                    {kpi.thresholdMin !== null ? kpi.thresholdMin : "—"}
                    {unit && kpi.thresholdMin !== null && (
                      <span className="ml-2 text-sm font-normal text-muted-foreground">
                        {unit}
                      </span>
                    )}
                  </p>
                </div>
                <div className="text-center p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900">
                  <p className="text-xs text-muted-foreground mb-1">
                    Max Threshold
                  </p>
                  <p className="text-lg font-bold text-amber-600 dark:text-amber-400">
                    {kpi.thresholdMax !== null ? kpi.thresholdMax : "—"}
                    {unit && kpi.thresholdMax !== null && (
                      <span className="ml-2 text-sm font-normal text-muted-foreground">
                        {unit}
                      </span>
                    )}
                  </p>
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Measurement & Dates */}
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Measurement
            </h4>
            <div className="grid gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Frequency</span>
                <span className="font-medium">
                  {KPI_FREQUENCY_LABELS[kpi.frequency] || kpi.frequency}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Effective From</span>
                <span>{formatDate(kpi.effectiveFrom)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Effective To</span>
                <span>
                  {kpi.effectiveTo
                    ? formatDate(kpi.effectiveTo)
                    : "No end date"}
                </span>
              </div>
            </div>
          </div>

          {/* Margin Ratchets */}
          {kpi.marginRatchets.length > 0 && (
            <>
              <Separator />
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Margin Ratchets
                </h4>
                {kpi.marginRatchets.map((ratchet) => (
                  <div
                    key={ratchet.id}
                    className="grid gap-2 grid-cols-3 text-center"
                  >
                    <div className="p-2 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900">
                      <p className="text-xs text-muted-foreground">Step Up</p>
                      <p className="font-bold text-green-600 dark:text-green-400">
                        +{ratchet.stepUpBps} bps
                      </p>
                    </div>
                    <div className="p-2 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900">
                      <p className="text-xs text-muted-foreground">Step Down</p>
                      <p className="font-bold text-red-600 dark:text-red-400">
                        -{ratchet.stepDownBps} bps
                      </p>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-950/30 border border-slate-200 dark:border-slate-800">
                      <p className="text-xs text-muted-foreground">Max</p>
                      <p className="font-bold">
                        ±{ratchet.maxAdjustmentBps} bps
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          <Separator />

          {/* Timestamps */}
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Timestamps
            </h4>
            <div className="grid gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Created</span>
                <span>{formatDate(kpi.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Last Updated</span>
                <span>{formatDate(kpi.updatedAt)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
