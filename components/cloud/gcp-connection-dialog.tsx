"use client";

import { connectGCP } from "@/app/actions/cloud";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { Textarea } from "@/components/ui/textarea";
import {
  ConnectGCPSchema,
  type ConnectGCPInput,
} from "@/lib/validations/cloud";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";

export function GCPConnectionDialog() {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const form = useForm<ConnectGCPInput>({
    resolver: zodResolver(ConnectGCPSchema),
    defaultValues: {
      projectId: "",
      serviceAccountKey: "",
    },
  });

  async function onSubmit(data: ConnectGCPInput) {
    setLoading(true);
    setError(null);

    const result = await connectGCP(data);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    } else {
      setOpen(false);
      form.reset();
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" variant="outline" className="w-full">
          Connect GCP
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Connect GCP Project</DialogTitle>
          <DialogDescription>
            Grant GreenRatchet read-only access to your GCP project for ESG data
            collection
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Card className="border-primary/20 bg-accent/30">
            <CardContent className="pt-6 space-y-3">
              <h4 className="font-medium text-sm">Setup Instructions</h4>
              <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
                <li>Go to GCP Console → IAM & Admin → Service Accounts</li>
                <li>
                  Create a new service account (e.g.,
                  &quot;greenratchet-esg&quot;)
                </li>
                <li>
                  Grant the following roles:
                  <ul className="ml-6 mt-1 space-y-1 list-disc">
                    <li>Billing Account Viewer</li>
                    <li>Compute Viewer</li>
                    <li>Cloud Asset Viewer</li>
                  </ul>
                </li>
                <li>Create and download a JSON key for this service account</li>
                <li>Paste the JSON key contents below</li>
              </ol>
            </CardContent>
          </Card>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {error && (
                <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}
              <FormField
                control={form.control}
                name="projectId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project ID</FormLabel>
                    <FormControl>
                      <Input placeholder="my-gcp-project" {...field} />
                    </FormControl>
                    <FormDescription>Your GCP project ID</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="serviceAccountKey"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Service Account Key (JSON)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder='{"type": "service_account", "project_id": "...", ...}'
                        {...field}
                        rows={8}
                        className="font-mono text-xs"
                      />
                    </FormControl>
                    <FormDescription>
                      Paste the entire JSON key file contents
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="rounded-md bg-yellow-50 border border-yellow-200 p-3">
                <p className="text-xs text-yellow-800">
                  <strong>For Hackathon Only:</strong> In production, service
                  account keys should be handled via secure key management
                  services, not uploaded directly.
                </p>
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
                  {loading ? "Connecting..." : "Connect GCP"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
