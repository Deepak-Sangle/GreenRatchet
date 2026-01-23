"use client";

import { KPI, MarginRatchet } from "@/app/generated/prisma/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MetricGrid } from "@/components/ui/metric-card";
import { Separator } from "@/components/ui/separator";
import {
  KPI_DIRECTION_LABELS,
  KPI_FREQUENCY_LABELS,
  KPI_STATUS_LABELS,
  KPI_TYPE_LABELS,
} from "@/lib/labels";
import { formatDate, getKPIUnit } from "@/lib/utils";
import { Target, TrendingDown, TrendingUp } from "lucide-react";
import { match } from "ts-pattern";

export type KPIData = KPI & {
  marginRatchets: MarginRatchet[];
};

interface KPIViewDialogProps {
  kpi: KPIData;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function KPIViewDialog({ kpi, open, onOpenChange }: KPIViewDialogProps) {
  const statusVariant = match(kpi.status)
    .with("ACCEPTED", () => "success" as const)
    .with("REJECTED", () => "destructive" as const)
    .with("PROPOSED", () => "warning" as const)
    .otherwise(() => "secondary" as const);

  const unit: string | null = getKPIUnit(kpi);

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

        <div className="space-y-4 pt-4">
          {/* KPI Overview */}
          <Card>
            <CardHeader className="pb-3 px-4">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 text-sm px-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Type</span>
                <Badge variant="outline">
                  {KPI_TYPE_LABELS[kpi.type] ?? kpi.type}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Unit</span>
                <span className="font-medium">{unit ?? "N/A"}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Direction</span>
                <span className="flex items-center gap-1.5 font-medium">
                  {kpi.direction === "LOWER_IS_BETTER" ? (
                    <TrendingDown className="h-4 w-4 text-primary" />
                  ) : kpi.direction === "HIGHER_IS_BETTER" ? (
                    <TrendingUp className="h-4 w-4 text-primary" />
                  ) : (
                    <Target className="h-4 w-4 text-info" />
                  )}
                  {KPI_DIRECTION_LABELS[kpi.direction] || kpi.direction}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Target & Thresholds */}
          <Card>
            <CardHeader className="pb-3 px-4">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Targets & Thresholds
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 px-4">
              <MetricGrid
                columns={2}
                metrics={[
                  {
                    label: "Target",
                    value: kpi.targetValue,
                    unit: unit ?? undefined,
                    highlighted: true,
                  },
                  {
                    label: "Baseline",
                    value: kpi.baselineValue !== null ? kpi.baselineValue : "—",
                    unit: unit && kpi.baselineValue !== null ? unit : undefined,
                  },
                ]}
              />
              {(kpi.thresholdMin !== null || kpi.thresholdMax !== null) && (
                <MetricGrid
                  columns={2}
                  metrics={[
                    {
                      label: "Min Threshold",
                      value: kpi.thresholdMin !== null ? kpi.thresholdMin : "—",
                      unit:
                        unit && kpi.thresholdMin !== null ? unit : undefined,
                    },
                    {
                      label: "Max Threshold",
                      value: kpi.thresholdMax !== null ? kpi.thresholdMax : "—",
                      unit:
                        unit && kpi.thresholdMax !== null ? unit : undefined,
                    },
                  ]}
                />
              )}
            </CardContent>
          </Card>

          {/* Measurement & Dates */}
          <Card>
            <CardHeader className="pb-3 px-4">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Measurement
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 text-sm px-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Frequency</span>
                <span className="font-medium">
                  {KPI_FREQUENCY_LABELS[kpi.frequency] || kpi.frequency}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Effective From</span>
                <span className="font-medium">
                  {formatDate(kpi.effectiveFrom)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Effective To</span>
                <span className="font-medium">
                  {kpi.effectiveTo
                    ? formatDate(kpi.effectiveTo)
                    : "No end date"}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Margin Ratchets */}
          {kpi.marginRatchets.length > 0 && (
            <Card>
              <CardHeader className="pb-3 px-4">
                <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Margin Ratchets
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 px-4">
                {kpi.marginRatchets.map((ratchet, index) => (
                  <div key={ratchet.id} className="space-y-2">
                    {kpi.marginRatchets.length > 1 && (
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                          Ratchet {index + 1}
                        </span>
                        <Separator className="flex-1" />
                      </div>
                    )}
                    <MetricGrid
                      columns={3}
                      metrics={[
                        {
                          label: "Step Up",
                          value: `+${ratchet.stepUpBps}`,
                          unit: "bps",
                          className:
                            "bg-success/10 text-success border-success/20",
                        },
                        {
                          label: "Step Down",
                          value: `-${ratchet.stepDownBps}`,
                          unit: "bps",
                          className:
                            "bg-destructive/10 text-destructive border-destructive/20",
                        },
                        {
                          label: "Max",
                          value: `±${ratchet.maxAdjustmentBps}`,
                          unit: "bps",
                        },
                      ]}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Timestamps */}
          <Card className="bg-muted/30 border-none shadow-none">
            <CardHeader className="pb-2 px-4">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Timestamps
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2 text-xs px-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Created</span>
                <span className="text-muted-foreground">
                  {formatDate(kpi.createdAt)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Last Updated</span>
                <span className="text-muted-foreground">
                  {formatDate(kpi.updatedAt)}
                </span>
              </div>
            </CardContent>
          </Card>
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
