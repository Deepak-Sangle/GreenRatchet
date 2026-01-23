"use client";

import { backfillCloudUsageAction } from "@/app/actions/cloud";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { AlertCircle, Database } from "lucide-react";
import { useCallback, useState } from "react";

export function BackfillUsageButton() {
  const [backfillDialogOpen, setBackfillDialogOpen] = useState(false);
  const [backfillLoading, setBackfillLoading] = useState(false);
  const [backfillError, setBackfillError] = useState<string | null>(null);

  /** Handles backfill action */
  const handleBackfill = useCallback(async () => {
    setBackfillLoading(true);
    setBackfillError(null);

    const result = await backfillCloudUsageAction();

    if (result.error) {
      setBackfillError(result.error);
      setBackfillLoading(false);
    } else {
      setBackfillLoading(false);
      setBackfillDialogOpen(true);
    }
  }, []);

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex flex-col gap-1">
            <Button
              onClick={handleBackfill}
              disabled={backfillLoading}
              variant="outline"
              className="gap-2"
            >
              <Database
                className={cn("h-4 w-4", backfillLoading && "animate-spin")}
              />
              Backfill Data
            </Button>
            {backfillError && (
              <div className="flex items-center gap-1.5 text-[10px] text-destructive mt-1">
                <AlertCircle className="h-3 w-3" />
                <span>{backfillError}</span>
              </div>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p className="max-w-xs">
            Backfill cloud usage data for the last 1 year. This process runs in
            the background and may take several minutes to complete.
          </p>
        </TooltipContent>
      </Tooltip>

      {/* Backfill Success Dialog */}
      <Dialog open={backfillDialogOpen} onOpenChange={setBackfillDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-primary" />
              Backfill Started
            </DialogTitle>
            <DialogDescription className="space-y-3 pt-2 text-foreground">
              <p>
                Your cloud usage data backfill has been initiated successfully.
                This process will retrieve and process data from the last 1
                year.
              </p>
              <div className="rounded-md bg-muted p-3 space-y-2">
                <p className="text-sm font-medium text-foreground">
                  What happens next?
                </p>
                <ul className="text-sm space-y-1 list-disc list-inside text-muted-foreground">
                  <li>Data is being fetched in the background</li>
                  <li>This may take several minutes to complete</li>
                  <li>You can continue using the application</li>
                </ul>
              </div>
              <p className="text-sm">
                <strong>Please click on refresh button</strong> to see the newly
                backfilled data in your charts and reports.
              </p>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setBackfillDialogOpen(false)}>Got it</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
