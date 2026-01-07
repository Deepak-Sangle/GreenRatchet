import { Button } from "@/components/ui/button";
import { ArrowLeft, Home } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-mesh p-4">
      <div className="mx-auto max-w-md text-center">
        {/* 404 Number */}
        <div className="mb-8">
          <h1 className="font-heading text-9xl font-bold tracking-tight text-primary">
            404
          </h1>
          <div className="mt-2 h-1 w-20 mx-auto rounded-full bg-gradient-to-r from-primary to-accent" />
        </div>

        {/* Error Message */}
        <h2 className="mb-3 font-heading text-2xl font-semibold tracking-tight">
          Page Not Found
        </h2>
        <p className="mb-8 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button asChild className="transition-all duration-200">
            <Link href="/dashboard">
              <Home className="mr-2 h-4 w-4" />
              Go to Dashboard
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="transition-all duration-200"
          >
            <Link href="javascript:history.back()">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
