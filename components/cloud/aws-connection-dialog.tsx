"use client";

import { connectAWS } from "@/app/actions/cloud";
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
import { CFN_TEMPLATE_URL } from "@/lib/constants";
import {
  ConnectAWSSchema,
  type ConnectAWSInput,
} from "@/lib/validations/cloud";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertTriangle,
  Copy,
  ExternalLink,
  RefreshCw,
  Shield,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";

// Generate a cryptographically random external ID
function generateExternalId(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join(
    ""
  );
}

export function AWSConnectionDialog() {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const form = useForm<ConnectAWSInput>({
    resolver: zodResolver(ConnectAWSSchema),
    defaultValues: {
      roleArn: "",
      externalId: "",
    },
  });

  const externalId = form.watch("externalId");

  // Generate external ID when dialog opens
  useEffect(() => {
    if (open && !form.getValues("externalId")) {
      form.setValue("externalId", generateExternalId());
    }
  }, [open, form]);

  const regenerateExternalId = useCallback(() => {
    form.setValue("externalId", generateExternalId());
  }, [form]);

  const copyExternalId = useCallback(async () => {
    const id = form.getValues("externalId");
    if (id) {
      await navigator.clipboard.writeText(id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [form]);

  // Build CloudFormation URL with the External ID parameter
  const cloudFormationUrl = externalId
    ? `https://console.aws.amazon.com/cloudformation/home#/stacks/create/review?templateURL=${encodeURIComponent(CFN_TEMPLATE_URL)}&stackName=GreenRatchet-ESG-Role&param_ExternalId=${encodeURIComponent(externalId)}`
    : `https://console.aws.amazon.com/cloudformation/home#/stacks/create/review?templateURL=${encodeURIComponent(CFN_TEMPLATE_URL)}&stackName=GreenRatchet-ESG-Role`;

  async function onSubmit(data: ConnectAWSInput) {
    setLoading(true);
    setError(null);

    const result = await connectAWS(data);

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
          Connect AWS
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Connect AWS Account</DialogTitle>
          <DialogDescription>
            Grant GreenRatchet read-only access to your AWS account for ESG data
            collection
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Step 1: External ID Configuration */}
          <Card className="border-amber-500/30 bg-amber-500/5">
            <CardContent className="pt-6 space-y-3">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-amber-500" />
                <h4 className="font-medium text-sm">
                  Step 1: Configure External ID (Strongly Recommended)
                </h4>
              </div>
              <p className="text-sm text-muted-foreground">
                External IDs prevent confused deputy attacks. We&apos;ve
                generated a unique ID for you. This ID will be passed to the
                CloudFormation template automatically.
              </p>

              <div className="flex items-center gap-2 p-3 bg-background rounded-lg border">
                <Input
                  value={externalId}
                  onChange={(e) => form.setValue("externalId", e.target.value)}
                  placeholder="Enter or generate an External ID"
                  className="font-mono text-sm border-0 p-0 h-auto focus-visible:ring-0"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={copyExternalId}
                  className="shrink-0"
                >
                  <Copy className="h-4 w-4" />
                  {copied ? "Copied!" : "Copy"}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={regenerateExternalId}
                  className="shrink-0"
                >
                  <RefreshCw className="h-4 w-4" />
                  New
                </Button>
              </div>

              {!externalId && (
                <div className="flex items-center gap-2 text-amber-600 text-sm">
                  <AlertTriangle className="h-4 w-4" />
                  <span>
                    Without an External ID, your IAM role may be vulnerable to
                    confused deputy attacks.
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Step 2: Deploy CloudFormation */}
          <Card className="border-primary/20 bg-accent/30">
            <CardContent className="pt-6 space-y-3">
              <h4 className="font-medium text-sm">
                Step 2: Deploy CloudFormation Stack
              </h4>
              <p className="text-sm text-muted-foreground">
                Click the button below to deploy an IAM role in your AWS
                account. This role grants read-only access to Cost Explorer,
                Cost Explorer, CloudWatch, and AWS services that potentially
                generate carbon emissions.
                {externalId && (
                  <span className="block mt-1 text-primary">
                    The External ID above will be pre-filled in the stack
                    parameters.
                  </span>
                )}
              </p>
              <a
                href={cloudFormationUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button type="button" variant="outline" className="w-full">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Launch CloudFormation Stack
                </Button>
              </a>
            </CardContent>
          </Card>

          {/* Step 3: Enter Role ARN */}
          <Card className="border-primary/20 bg-blue-50">
            <CardContent className="pt-6 space-y-3">
              <h4 className="font-medium text-sm">
                Step 3: Enter Role Details
              </h4>
              <p className="text-sm text-muted-foreground">
                After the stack is created, copy the Role ARN from the
                CloudFormation Outputs tab and paste it below.
              </p>
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
                name="roleArn"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role ARN</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="arn:aws:iam::123456789012:role/GreenRatchetReadOnly"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Found in CloudFormation stack outputs
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="externalId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      External ID
                      <span className="text-xs text-amber-600 font-normal">
                        (Strongly Recommended)
                      </span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="your-external-id"
                        className="font-mono"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Must match the External ID used when creating the
                      CloudFormation stack
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Connecting..." : "Connect AWS"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
