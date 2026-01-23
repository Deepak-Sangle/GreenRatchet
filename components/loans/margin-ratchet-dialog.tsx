"use client";

import { createMarginRatchet, editMarginRatchet } from "@/app/actions/loans";
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
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CreateMarginRatchetFormSchema,
  type CreateMarginRatchetForm,
} from "@/lib/validations/loan";
import { zodResolver } from "@hookform/resolvers/zod";
import { ReactNode, useState } from "react";
import { useForm } from "react-hook-form";
import { match } from "ts-pattern";
import z from "zod";

interface KPIOption {
  id: string;
  name: string;
}

interface MarginRatchetDialogProps {
  loanId: string;
  kpis: KPIOption[];
  initialValue?: CreateMarginRatchetForm;
  dialogTrigger: ReactNode;
  mode?: "create" | "duplicate" | "edit";
  ratchetId?: string;
}

export function MarginRatchetDialog({
  loanId,
  kpis,
  initialValue,
  dialogTrigger: triggerButton,
  mode = "create",
  ratchetId,
}: MarginRatchetDialogProps) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const form = useForm({
    resolver: zodResolver(CreateMarginRatchetFormSchema),
    defaultValues: {
      kpiId: initialValue?.kpiId || "",
      observationStart: initialValue?.observationStart,
      observationEnd: initialValue?.observationEnd,
      stepUpBps: initialValue?.stepUpBps ?? 0,
      stepDownBps: initialValue?.stepDownBps ?? 0,
      maxAdjustmentBps: initialValue?.maxAdjustmentBps ?? 0,
    },
  });

  async function onSubmit(data: CreateMarginRatchetForm) {
    setLoading(true);
    setError(null);

    const result = await match(mode)
      .with("edit", () => editMarginRatchet(ratchetId, data))
      .with("duplicate", () => createMarginRatchet(loanId, data))
      .with("create", () => createMarginRatchet(loanId, data))
      .exhaustive();

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    } else {
      setOpen(false);
      form.reset();
      setLoading(false);
    }
  }

  const dialogTitle: string = match(mode)
    .with("create", () => "Configure Margin Ratchet")
    .with("edit", () => "Edit Margin Ratchet")
    .with("duplicate", () => "Duplicate Margin Ratchet")
    .exhaustive();

  const dialogDescription: string = match(mode)
    .with(
      "create",
      () =>
        "Define how the loan margin adjusts based on KPI performance. Step up increases interest rate when targets are not met, step down decreases interest rate when targets are met.",
    )
    .with(
      "edit",
      () =>
        "Update the margin ratchet configuration. Changes will be saved immediately.",
    )
    .with(
      "duplicate",
      () =>
        "Create a new margin ratchet based on the existing configuration. Modify the values as needed.",
    )
    .exhaustive();

  const submitButtonText: string = match(mode)
    .with("edit", () => "Save Changes")
    .with("duplicate", () => "Create Duplicate")
    .with("create", () => "Create Ratchet")
    .exhaustive();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{triggerButton}</DialogTrigger>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogDescription>{dialogDescription}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <FormField
              control={form.control}
              name="kpiId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>KPI</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select KPI" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {kpis.map((kpi) => (
                        <SelectItem key={kpi.id} value={kpi.id}>
                          {kpi.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    The KPI that will trigger margin adjustments
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="observationStart"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observation Start</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        {...field}
                        value={
                          z.coerce
                            .date()
                            .safeParse(field.value)
                            .data?.toISOString()
                            .split("T")[0] ?? ""
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="observationEnd"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observation End (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        {...field}
                        value={
                          z.coerce
                            .date()
                            .safeParse(field.value)
                            .data?.toISOString()
                            .split("T")[0] ?? ""
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-medium">
                Margin Adjustments (Basis Points)
              </h4>
              <p className="text-xs text-muted-foreground">
                1 basis point = 0.01%. Step up is applied when targets are met,
                step down when missed.
              </p>
              <div className="grid gap-4 md:grid-cols-3">
                <FormField
                  control={form.control}
                  name="stepUpBps"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Step Up (bps)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="5"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value) || 0)
                          }
                        />
                      </FormControl>
                      <FormDescription>Reduce margin by</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="stepDownBps"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Step Down (bps)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="5"
                          {...field}
                          // seems like e.target.value is a always a string
                          // no matter the type="number"
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value) || 0)
                          }
                        />
                      </FormControl>
                      <FormDescription>Increase margin by</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="maxAdjustmentBps"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max Adjustment (bps)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="25"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value) || 0)
                          }
                        />
                      </FormControl>
                      <FormDescription>Maximum total change</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Creating..." : submitButtonText}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
