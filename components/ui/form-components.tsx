import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { ReactNode } from "react";
import { FieldError, UseFormRegister } from "react-hook-form";

interface FormFieldProps {
  label: string;
  name: string;
  register: UseFormRegister<any>;
  error?: FieldError;
  type?: "text" | "email" | "password" | "number" | "textarea";
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
}

export function FormField({
  label,
  name,
  register,
  error,
  type = "text",
  placeholder,
  disabled = false,
  required = false,
  className = "",
}: FormFieldProps) {
  const Component = type === "textarea" ? Textarea : Input;
  const inputType = type === "textarea" ? undefined : type;

  return (
    <div className={`space-y-2 ${className}`}>
      <Label htmlFor={name}>
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <Component
        id={name}
        type={inputType}
        placeholder={placeholder}
        disabled={disabled}
        {...register(name)}
        className={error ? "border-destructive" : ""}
      />
      {error && (
        <p className="text-sm text-destructive">{error.message}</p>
      )}
    </div>
  );
}

interface FormButtonProps {
  loading?: boolean;
  disabled?: boolean;
  children: ReactNode;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  type?: "button" | "submit" | "reset";
}

export function FormButton({
  loading = false,
  disabled = false,
  children,
  variant = "default",
  size = "default",
  className = "",
  type = "submit",
}: FormButtonProps) {
  return (
    <Button
      type={type}
      variant={variant}
      size={size}
      disabled={loading || disabled}
      className={className}
    >
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
          Loading...
        </>
      ) : (
        children
      )}
    </Button>
  );
}

interface FormSectionProps {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

export function FormSection({
  title,
  description,
  children,
  className = "",
}: FormSectionProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      <div>
        <h3 className="font-heading text-lg font-semibold">{title}</h3>
        {description && (
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        )}
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

interface FormGridProps {
  children: ReactNode;
  columns?: 1 | 2 | 3 | 4;
  className?: string;
}

export function FormGrid({ 
  children, 
  columns = 2, 
  className = "" 
}: FormGridProps) {
  const gridClasses = {
    1: "grid-cols-1",
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
  };

  return (
    <div className={`grid gap-4 ${gridClasses[columns]} ${className}`}>
      {children}
    </div>
  );
}
