"use client";

import { createKPI } from "@/app/actions/kpis";
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
import { CreateKPIFormSchema, type CreateKPIForm } from "@/lib/validations/kpi";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
// Assuming client types are available globally or imported.
// Actually client types are usually in @prisma/client.

// Map KPI Type to readable name or handle conversion
const KPI_TYPES: Record<string, string> = {
  CO2_EMISSION: "CO2 Emission",
  AI_COMPUTE_HOURS: "AI Compute Hours",
  LOW_CARBON_REGION_PERCENTAGE: "Low Carbon Region %",
  CARBON_FREE_ENERGY_PERCENTAGE: "Carbon Free Energy %",
  ELECTRICITY_MIX_BREAKDOWN: "Electricity Mix Breakdown",
  RENEWABLE_ENERGY_PERCENTAGE: "Renewable Energy %",
  ENERGY_CONSUMPTION: "Energy Consumption",
  WATER_WITHDRAWAL: "Water Withdrawal",
  GHG_INTENSITY: "GHG Intensity",
  WATER_STRESSED_REGION_PERCENTAGE: "Water Stressed Region %",
};

interface CreateKpiDialogProps {
  kpiType?: string; // Pre-select type
  defaultName?: string;
}

export function CreateKpiDialog({
  kpiType,
  defaultName,
}: CreateKpiDialogProps) {
  const [open, setOpen] = useState(false);

  const form = useForm<CreateKPIForm>({
    resolver: zodResolver(CreateKPIFormSchema),
    defaultValues: {
      type: (kpiType as any) || "CO2_EMISSION",
      name: defaultName || "",
      direction: "LOWER_IS_BETTER",
      frequency: "MONTHLY",
      targetValue: 0,
      effectiveFrom: new Date().toISOString().split("T")[0],
      effectiveTo: undefined,
    },
  });

  async function onSubmit(data: CreateKPIForm) {
    try {
      const result = await createKPI(data);

      if ("error" in result) {
        toast.error(result.error);
        return;
      }

      toast.success("KPI created successfully");
      setOpen(false);
      form.reset();
    } catch (error) {
      toast.error("Failed to create KPI");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          Track KPI
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Track KPI</DialogTitle>
          <DialogDescription>
            Set up a tracked KPI for your organization.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. Reduce Carbon Footprint"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>KPI Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={!!kpiType}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(KPI_TYPES).map(([key, label]) => (
                          <SelectItem key={key} value={key}>
                            {label}
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
                name="targetValue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target Value</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="direction"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Direction</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="LOWER_IS_BETTER">
                          Lower is better
                        </SelectItem>
                        <SelectItem value="HIGHER_IS_BETTER">
                          Higher is better
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="frequency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Frequency</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="MONTHLY">Monthly</SelectItem>
                        <SelectItem value="QUARTERLY">Quarterly</SelectItem>
                        <SelectItem value="ANNUAL">Annual</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="effectiveFrom"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button type="submit">Create KPI</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
