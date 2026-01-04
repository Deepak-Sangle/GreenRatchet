"use client";

import { createLoan } from "@/app/actions/loans";
import {
  LoanCurrencySchema,
  LoanTypeSchema,
} from "@/app/generated/schemas/schemas";
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
import { CURRENCY_LABELS, LOAN_TYPE_LABELS } from "@/lib/labels";
import {
  CreateLoanFormSchema,
  type CreateLoanForm,
} from "@/lib/validations/loan";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

// Get enum values from generated schemas
const LOAN_TYPES = LoanTypeSchema.options;
const CURRENCIES = LoanCurrencySchema.options;

export default function NewLoanPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const form = useForm<CreateLoanForm>({
    resolver: zodResolver(CreateLoanFormSchema),
    defaultValues: {
      name: "",
      currency: "USD",
      principalAmount: 0,
      committedAmount: -1,
      drawnAmount: -1,
      type: "FIXED_RATE",
      startDate: "",
      maturityDate: "",
    },
  });

  async function onSubmit(data: CreateLoanForm) {
    console.log(data);
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
            KPIs and margin ratchets after creating the deal.
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-6">
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
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Loan Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select loan type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {LOAN_TYPES.map((type) => (
                            <SelectItem key={type} value={type}>
                              {LOAN_TYPE_LABELS[type] || type}
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
                          {CURRENCIES.map((currency) => (
                            <SelectItem key={currency} value={currency}>
                              {CURRENCY_LABELS[currency] || currency}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-medium">Loan Amounts</h3>
                <p className="text-xs text-muted-foreground">
                  Enter -1 for any field that is not applicable. At least one
                  amount should be set.
                </p>
                <div className="grid gap-4 md:grid-cols-3">
                  <FormField
                    control={form.control}
                    name="principalAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Principal Amount</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="1000000"
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
                  <FormField
                    control={form.control}
                    name="committedAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Committed Amount</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="-1"
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
                  <FormField
                    control={form.control}
                    name="drawnAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Drawn Amount</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="-1"
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
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="startDate"
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
                <FormField
                  control={form.control}
                  name="maturityDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Maturity Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
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
            After creating the deal, you can add KPIs and configure margin
            ratchets for each KPI. Margin ratchets define how the loan margin
            adjusts based on KPI performance.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
