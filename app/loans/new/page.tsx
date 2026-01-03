"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { createLoan } from "@/app/actions/loans";
import { createLoanSchema, type CreateLoanInput } from "@/lib/validations/loan";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NewLoanPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const form = useForm<CreateLoanInput>({
    resolver: zodResolver(createLoanSchema),
    defaultValues: {
      name: "",
      currency: "USD",
      observationPeriod: "Annual",
      marginRatchetBps: 0,
    },
  });

  async function onSubmit(data: CreateLoanInput) {
    setLoading(true);
    setError(null);

    const result = await createLoan(data);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    } else if (result?.loanId) {
      router.push(`/loans/${result.loanId}`);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <Link
          href="/dashboard"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold">Create SLL Deal</h1>
        <p className="text-muted-foreground mt-2">
          Set up a new Sustainability-Linked Loan agreement
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Deal Information</CardTitle>
          <CardDescription>
            Enter the basic details of your SLL deal. You&apos;ll be able to add
            KPIs after creating the deal.
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
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
                    <FormLabel>Deal Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Q4 2024 Green Financing" {...field} />
                    </FormControl>
                    <FormDescription>
                      A descriptive name for this SLL deal
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="currency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Currency</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select currency" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="USD">USD</SelectItem>
                          <SelectItem value="EUR">EUR</SelectItem>
                          <SelectItem value="GBP">GBP</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="observationPeriod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Observation Period</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select period" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Annual">Annual</SelectItem>
                          <SelectItem value="Quarterly">Quarterly</SelectItem>
                          <SelectItem value="Monthly">Monthly</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        How often KPIs will be measured
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="marginRatchetBps"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Margin Ratchet (bps)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="25"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormDescription>
                      Basis points adjustment for margin (+/- bps). Positive values
                      reward KPI achievement, negative penalize failure.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <div className="flex justify-end gap-3 p-6 pt-0">
              <Link href="/dashboard">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create Deal"}
              </Button>
            </div>
          </form>
        </Form>
      </Card>

      <Card className="border-primary/20 bg-accent/50">
        <CardHeader>
          <CardTitle className="text-base">Important Note</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Enter KPIs as commercially agreed. Legal documentation happens
            outside the platform. This system provides automated, continuous,
            cloud-native ESG assurance with full auditability.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
