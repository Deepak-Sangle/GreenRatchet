"use client";

import { createKPI } from "@/app/actions/loans";
import { KPI } from "@/app/generated/prisma/client";
import {
  KpiCategorySchema,
  KpiDirectionSchema,
  KpiValueTypeSchema,
  ObservationPeriodSchema,
} from "@/app/generated/schemas/schemas";
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
  KPI_CATEGORY_LABELS,
  KPI_DIRECTION_LABELS,
  KPI_FREQUENCY_LABELS,
  KPI_VALUE_TYPE_LABELS,
} from "@/lib/labels";
import {
  CreateKPIFormSchema,
  type CreateKPIForm,
} from "@/lib/validations/loan";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

// Get enum values from generated schemas
const KPI_CATEGORIES = KpiCategorySchema.options;
const KPI_VALUE_TYPES = KpiValueTypeSchema.options;
const KPI_DIRECTIONS = KpiDirectionSchema.options;
const KPI_FREQUENCIES = ObservationPeriodSchema.options;

// Helper to format date for input[type="date"]
function formatDateForInput(date: Date | string | undefined | null): string {
  if (!date) return "";
  const d = new Date(date);
  return d.toISOString().split("T")[0];
}

export type KPIInitialData = KPI;

interface KPIFormDialogProps {
  loanId: string;
  /** Optional: control dialog open state externally */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Optional: pre-fill form with initial data (for duplication) */
  initialData?: KPIInitialData;
  /** If true, hides the trigger button (use for controlled mode) */
  hideTrigger?: boolean;
}

const defaultFormValues: CreateKPIForm = {
  name: "",
  category: "ENVIRONMENTAL",
  valueType: "INTENSITY",
  direction: "LOWER_IS_BETTER",
  unit: "",
  targetValue: 0,
  thresholdMin: undefined,
  thresholdMax: undefined,
  frequency: "ANNUAL",
  baselineValue: undefined,
  effectiveFrom: "",
  effectiveTo: undefined,
};

export function KPIFormDialog({
  loanId,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  initialData,
  hideTrigger = false,
}: KPIFormDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Support both controlled and uncontrolled modes
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled
    ? (value: boolean) => controlledOnOpenChange?.(value)
    : setInternalOpen;

  const form = useForm<CreateKPIForm>({
    resolver: zodResolver(CreateKPIFormSchema),
    defaultValues: defaultFormValues,
  });

  // Reset form with initial data when dialog opens or initialData changes
  useEffect(() => {
    if (open && initialData) {
      form.reset({
        ...initialData,
        name: `Copy of ${initialData.name}`,
        effectiveFrom: formatDateForInput(initialData.effectiveFrom),
        effectiveTo: initialData.effectiveTo
          ? formatDateForInput(initialData.effectiveTo)
          : undefined,
      });
    } else if (open && !initialData) {
      form.reset(defaultFormValues);
    }
  }, [open, initialData, form]);

  async function onSubmit(data: CreateKPIForm) {
    setLoading(true);
    setError(null);

    const result = await createKPI(loanId, data);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    } else {
      setOpen(false);
      form.reset(defaultFormValues);
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {!hideTrigger && (
        <DialogTrigger asChild>
          <Button>
            <Plus className="h-4" />
            Add KPI
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Duplicate ESG KPI" : "Add ESG KPI"}
          </DialogTitle>
          <DialogDescription>
            {initialData
              ? "Create a new KPI based on an existing one. Modify the fields as needed."
              : "Define a new sustainability KPI for this SLL deal. Configure margin ratchets separately after creating the KPI."}
          </DialogDescription>
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
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>KPI Name</FormLabel>
                  <FormControl>
                    <Input placeholder="AI Carbon Intensity" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {KPI_CATEGORIES.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {KPI_CATEGORY_LABELS[cat] || cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="valueType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Value Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select value type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {KPI_VALUE_TYPES.map((type) => (
                          <SelectItem key={type} value={type}>
                            {KPI_VALUE_TYPE_LABELS[type] || type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="direction"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Direction</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select direction" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {KPI_DIRECTIONS.map((dir) => (
                          <SelectItem key={dir} value={dir}>
                            {KPI_DIRECTION_LABELS[dir] || dir}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Whether lower or higher values are better
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="frequency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Measurement Frequency</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select frequency" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {KPI_FREQUENCIES.map((freq) => (
                          <SelectItem key={freq} value={freq}>
                            {KPI_FREQUENCY_LABELS[freq] || freq}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unit</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="tCO₂e / 1,000 compute hours"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="targetValue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target Value</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="8.0"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseFloat(e.target.value) || 0)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <FormField
                control={form.control}
                name="baselineValue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Baseline Value</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="10.5"
                        {...field}
                        value={field.value ?? ""}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value
                              ? parseFloat(e.target.value)
                              : undefined
                          )
                        }
                      />
                    </FormControl>
                    <FormDescription>Current value (optional)</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="thresholdMin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Threshold Min</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="7.0"
                        {...field}
                        value={field.value ?? ""}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value
                              ? parseFloat(e.target.value)
                              : undefined
                          )
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="thresholdMax"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Threshold Max</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="9.0"
                        {...field}
                        value={field.value ?? ""}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value
                              ? parseFloat(e.target.value)
                              : undefined
                          )
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* <FormField
              control={form.control}
              name="calculationFormula"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Calculation Formula</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="(Total tCO₂e from GPU instances) / (Total compute hours) × 1000"
                      {...field}
                      rows={2}
                    />
                  </FormControl>
                  <FormDescription>
                    How this KPI will be calculated from data sources
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="calculationDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Total carbon emissions from AI workloads divided by total compute hours..."
                      {...field}
                      rows={2}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <h4 className="text-sm font-medium">Data Source</h4>
              <div className="grid gap-4 md:grid-cols-3">
                <FormField
                  control={form.control}
                  name="dataSourceType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="CLOUD">Cloud Provider</SelectItem>
                          <SelectItem value="API">External API</SelectItem>
                          <SelectItem value="MANUAL">Manual Entry</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="dataSourceProvider"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Provider</FormLabel>
                      <FormControl>
                        <Input placeholder="AWS" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="dataSourceMetric"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Metric</FormLabel>
                      <FormControl>
                        <Input placeholder="carbon-footprint" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div> */}

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="effectiveFrom"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Effective From</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="effectiveTo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Effective To (Optional)</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
                {loading
                  ? "Creating..."
                  : initialData
                    ? "Create Duplicate"
                    : "Add KPI"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
