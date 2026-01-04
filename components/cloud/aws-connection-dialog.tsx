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
import {
  ConnectAWSSchema,
  type ConnectAWSInput,
} from "@/lib/validations/cloud";
import { zodResolver } from "@hookform/resolvers/zod";
import { ExternalLink } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";

interface AWSConnectionDialogProps {
  accountId: string; // Your AWS account ID for the trust policy
}

export function AWSConnectionDialog({ accountId }: AWSConnectionDialogProps) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const form = useForm<ConnectAWSInput>({
    resolver: zodResolver(ConnectAWSSchema),
    defaultValues: {
      roleArn: "",
      externalId: "",
    },
  });

  const cloudFormationUrl = `https://console.aws.amazon.com/cloudformation/home#/stacks/create/review?templateURL=https://greenratchet-cfn.s3.amazonaws.com/esg-assurance-role.yaml&stackName=GreenRatchet-ESG-Role&param_ExternalAccountId=${accountId}`;

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
        <Button size="lg" className="w-full">
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
          <Card className="border-primary/20 bg-accent/30">
            <CardContent className="pt-6 space-y-3">
              <h4 className="font-medium text-sm">
                Step 1: Deploy CloudFormation Stack
              </h4>
              <p className="text-sm text-muted-foreground">
                Click the button below to deploy an IAM role in your AWS
                account. This role grants read-only access to Cost Explorer,
                EC2, and EKS for carbon emissions calculation.
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

          <Card className="border-primary/20 bg-accent/30">
            <CardContent className="pt-6 space-y-3">
              <h4 className="font-medium text-sm">
                Step 2: Enter Role Details
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
                        placeholder="arn:aws:iam::123456789012:role/GreenRatchet-ESG-Role"
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
                    <FormLabel>External ID (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="your-external-id" {...field} />
                    </FormControl>
                    <FormDescription>
                      Additional security layer (optional)
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
