"use client";

import { createMarginRatchet } from "@/app/actions/loans";
import { ObservationPeriodSchema } from "@/app/generated/schemas/schemas";
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
import { Settings2 } from "lucide-react";
import { ReactNode, useState } from "react";
import { useForm } from "react-hook-form";

// Get enum values from generated schemas
const OBSERVATION_PERIODS = ObservationPeriodSchema.options;

interface KPIOption {
  id: string;
  name: string;
}

interface MarginRatchetDialogProps {
  loanId: string;
  kpis: KPIOption[];
  defaultKpiId?: string;
  defaultValues?: {
    stepUpBps?: number;
    stepDownBps?: number;
    maxAdjustmentBps?: number;
  };
  triggerButton?: ReactNode;
  mode?: "create" | "duplicate";
}

export function MarginRatchetDialog({
  loanId,
  kpis,
  defaultKpiId,
  defaultValues,
  triggerButton,
  mode = "create",
}: MarginRatchetDialogProps) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const form = useForm<CreateMarginRatchetForm>({
    resolver: zodResolver(CreateMarginRatchetFormSchema),
    defaultValues: {
      kpiId: defaultKpiId || "",
      observationStart: "",
      observationEnd: "",
      stepUpBps: defaultValues?.stepUpBps ?? 0,
      stepDownBps: defaultValues?.stepDownBps ?? 0,
      maxAdjustmentBps: defaultValues?.maxAdjustmentBps ?? 0,
    },
  });

  async function onSubmit(data: CreateMarginRatchetForm) {
    setLoading(true);
    setError(null);

    const result = await createMarginRatchet(loanId, data);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    } else {
      setOpen(false);
      form.reset();
      setLoading(false);
    }
  }

  const isDuplicate = mode === "duplicate";
  const dialogTitle = isDuplicate
    ? "Duplicate Margin Ratchet"
    : "Configure Margin Ratchet";
  const dialogDescription = isDuplicate
    ? "Create a new margin ratchet based on the existing configuration. Modify the values as needed."
    : "Define how the loan margin adjusts based on KPI performance. Step up increases interest rate when targets are not met, step down decreases interest rate when targets are met.";
  const submitButtonText = isDuplicate ? "Create Duplicate" : "Create Ratchet";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {triggerButton || (
          <Button variant="outline" size="sm">
            <Settings2 className="mr-2 h-4 w-4" />
            Add Margin Ratchet
          </Button>
        )}
      </DialogTrigger>
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
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
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
                      <Input type="date" {...field} />
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
                      <Input type="date" {...field} />
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
