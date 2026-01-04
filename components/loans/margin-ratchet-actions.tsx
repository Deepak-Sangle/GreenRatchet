"use client";

import { deleteMarginRatchet } from "@/app/actions/loans";
import { KPI, MarginRatchet } from "@/app/generated/prisma/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Copy, Trash2 } from "lucide-react";
import { useState } from "react";
import { MarginRatchetDialog } from "./margin-ratchet-dialog";
import { MarginRatchetViewDialog } from "./margin-ratchet-view-dialog";

interface KPIOption {
  id: string;
  name: string;
}

interface MarginRatchetActionsProps {
  loanId: string;
  ratchet: MarginRatchet & {
    kpi: KPI;
  };
  kpis: KPIOption[];
  isBorrower: boolean;
}

export function MarginRatchetActions({
  loanId,
  ratchet,
  kpis,
  isBorrower,
}: MarginRatchetActionsProps) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  async function handleDelete() {
    setDeleteLoading(true);
    setDeleteError(null);

    const result = await deleteMarginRatchet(ratchet.id);

    if (result?.error) {
      setDeleteError(result.error);
      setDeleteLoading(false);
    } else {
      setDeleteOpen(false);
      setDeleteLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-1">
      {/* View Dialog */}
      <MarginRatchetViewDialog ratchet={ratchet} />

      {/* Duplicate Button - Opens create dialog with pre-filled values */}
      {isBorrower && kpis.length > 0 && (
        <MarginRatchetDialog
          loanId={loanId}
          kpis={kpis}
          defaultKpiId={ratchet.kpi.id}
          defaultValues={{
            stepUpBps: ratchet.stepUpBps,
            stepDownBps: ratchet.stepDownBps,
            maxAdjustmentBps: ratchet.maxAdjustmentBps,
          }}
          triggerButton={
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Copy className="h-4 w-4" />
            </Button>
          }
          mode="duplicate"
        />
      )}

      {/* Delete Dialog */}
      {isBorrower && (
        <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Margin Ratchet</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this margin ratchet? This action
                cannot be undone.
              </DialogDescription>
            </DialogHeader>

            {deleteError && (
              <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                {deleteError}
              </div>
            )}

            <div className="rounded-lg border p-3 bg-muted/30">
              <p className="font-medium">Linked to: {ratchet.kpi.name}</p>
              <p className="text-sm text-muted-foreground">
                Step Up: +{ratchet.stepUpBps} bps • Step Down: +
                {ratchet.stepDownBps} bps
              </p>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDeleteOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={deleteLoading}
              >
                {deleteLoading ? "Deleting..." : "Delete"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
