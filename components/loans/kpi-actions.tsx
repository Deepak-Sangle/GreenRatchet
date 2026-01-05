"use client";

import { deleteKPI } from "@/app/actions/loans";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Copy, Eye, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { KPIFormDialog } from "./kpi-form-dialog";
import { KPIData, KPIViewDialog } from "./kpi-view-dialog";

interface KPIActionsProps {
  kpi: KPIData;
  loanId: string;
  isBorrower: boolean;
}

export function KPIActions({ kpi, loanId, isBorrower }: KPIActionsProps) {
  const [viewOpen, setViewOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [duplicateOpen, setDuplicateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    setLoading(true);
    setError(null);

    const result = await deleteKPI(kpi.id);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    } else {
      setDeleteOpen(false);
      setLoading(false);
    }
  }

  return (
    <>
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setViewOpen(true)}
          title="View details"
        >
          <Eye className="h-4 w-4" />
        </Button>
        {isBorrower && (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setEditOpen(true)}
              title="Edit KPI"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDuplicateOpen(true)}
              title="Duplicate KPI"
            >
              <Copy className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDeleteOpen(true)}
              title="Delete KPI"
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>

      {/* View Dialog */}
      <KPIViewDialog kpi={kpi} open={viewOpen} onOpenChange={setViewOpen} />

      {/* Edit Dialog - opens KPI form pre-filled with current KPI data */}
      <KPIFormDialog
        loanId={loanId}
        open={editOpen}
        onOpenChange={setEditOpen}
        initialData={kpi}
        hideTrigger
        mode="edit"
        kpiId={kpi.id}
      />

      {/* Duplicate Dialog - opens KPI form pre-filled with current KPI data */}
      <KPIFormDialog
        loanId={loanId}
        open={duplicateOpen}
        onOpenChange={setDuplicateOpen}
        initialData={kpi}
        hideTrigger
        mode="duplicate"
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete KPI</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{kpi.name}&quot;? This
              action cannot be undone. All associated margin ratchets and
              results will also be deleted.
            </DialogDescription>
          </DialogHeader>
          {error && (
            <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
              {error}
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={loading}
            >
              {loading ? "Deleting..." : "Delete KPI"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
