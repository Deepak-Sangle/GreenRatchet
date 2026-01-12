import { Loader2 } from "lucide-react";

interface LoadingStateProps {
  message?: string;
  className?: string;
}

export function LoadingState({ 
  message = "Loading data...", 
  className = "" 
}: LoadingStateProps) {
  return (
    <div className={`bg-muted/50 rounded-lg p-8 text-center ${className}`}>
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mx-auto mb-2" />
      <p className="text-muted-foreground">{message}</p>
    </div>
  );
}

interface ErrorStateProps {
  error: string;
  className?: string;
}

export function ErrorState({ error, className = "" }: ErrorStateProps) {
  return (
    <div className={`rounded-md bg-destructive/15 p-3 text-sm text-destructive ${className}`}>
      {error}
    </div>
  );
}

interface SuccessStateProps {
  message: string;
  details?: string;
  className?: string;
}

export function SuccessState({ 
  message, 
  details, 
  className = "" 
}: SuccessStateProps) {
  return (
    <div className={`rounded-md bg-primary/10 p-3 text-sm ${className}`}>
      <p className="font-medium text-primary">{message}</p>
      {details && (
        <p className="text-xs text-muted-foreground mt-1">{details}</p>
      )}
    </div>
  );
}
