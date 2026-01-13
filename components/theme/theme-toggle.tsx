"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Monitor, Moon, Sun } from "lucide-react";
import * as React from "react";
import { useTheme } from "./use-theme";

export interface ThemeToggleProps {
  variant?: "default" | "icon" | "dropdown";
  size?: "sm" | "md" | "lg";
  className?: string;
}

const themeIcons = {
  light: Sun,
  dark: Moon,
  system: Monitor,
} as const;

const themeLabels = {
  light: "Light",
  dark: "Dark",
  system: "System",
} as const;

export function ThemeToggle({
  variant = "default",
  size = "md",
  className,
}: ThemeToggleProps) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [isChanging, setIsChanging] = React.useState(false);

  const handleThemeChange = React.useCallback(
    (newTheme: "light" | "dark" | "system") => {
      setIsChanging(true);
      setTheme(newTheme);

      // Reset changing state after transition
      setTimeout(() => setIsChanging(false), 200);
    },
    [setTheme]
  );

  const cycleTheme = React.useCallback(() => {
    const themes: Array<"light" | "dark" | "system"> = [
      "light",
      "dark",
      "system",
    ];
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    handleThemeChange(themes[nextIndex]);
  }, [theme, handleThemeChange]);

  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        cycleTheme();
      }
    },
    [cycleTheme]
  );

  // Size mappings
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-9 w-9",
    lg: "h-10 w-10",
  };

  const iconSizes = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  if (variant === "dropdown") {
    return (
      <Select value={theme} onValueChange={handleThemeChange}>
        <SelectTrigger
          className={cn(
            "w-[140px] transition-all duration-200",
            isChanging && "scale-95 opacity-75",
            className
          )}
          aria-label="Select theme"
        >
          <div className="flex items-center gap-2">
            {React.createElement(themeIcons[theme], {
              className: iconSizes[size],
              "aria-hidden": "true",
            })}
            <SelectValue placeholder="Theme" />
          </div>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="light">
            <div className="flex items-center gap-2">
              <Sun className={iconSizes[size]} aria-hidden="true" />
              Light
            </div>
          </SelectItem>
          <SelectItem value="dark">
            <div className="flex items-center gap-2">
              <Moon className={iconSizes[size]} aria-hidden="true" />
              Dark
            </div>
          </SelectItem>
          <SelectItem value="system">
            <div className="flex items-center gap-2">
              <Monitor className={iconSizes[size]} aria-hidden="true" />
              System
            </div>
          </SelectItem>
        </SelectContent>
      </Select>
    );
  }

  if (variant === "icon") {
    const CurrentIcon = themeIcons[theme];

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={cycleTheme}
              onKeyDown={handleKeyDown}
              className={cn(
                sizeClasses[size],
                "transition-all duration-200 hover:bg-accent/60",
                isChanging && "scale-95 opacity-75",
                className
              )}
              aria-label={`Switch to ${
                theme === "light"
                  ? "dark"
                  : theme === "dark"
                    ? "system"
                    : "light"
              } theme`}
              aria-pressed={false}
              role="button"
            >
              <CurrentIcon
                className={cn(
                  iconSizes[size],
                  "transition-all duration-200",
                  isChanging && "rotate-180"
                )}
                aria-hidden="true"
              />
              <span className="sr-only">
                Current theme: {themeLabels[theme]}. Click to cycle themes.
              </span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>
              {themeLabels[theme]} theme
              <br />
              <span className="text-xs text-muted-foreground">
                Click to cycle themes
              </span>
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Default button variant
  const CurrentIcon = themeIcons[theme];

  return (
    <Button
      variant="outline"
      onClick={cycleTheme}
      onKeyDown={handleKeyDown}
      className={cn(
        "gap-2 transition-all duration-200",
        isChanging && "scale-95 opacity-75",
        className
      )}
      aria-label={`Switch to ${
        theme === "light" ? "dark" : theme === "dark" ? "system" : "light"
      } theme`}
      aria-pressed={false}
      role="button"
    >
      <CurrentIcon
        className={cn(
          iconSizes[size],
          "transition-all duration-200",
          isChanging && "rotate-180"
        )}
        aria-hidden="true"
      />
      <span className="hidden sm:inline-block">{themeLabels[theme]}</span>
      <span className="sr-only">
        Current theme: {themeLabels[theme]}. Click to cycle themes.
      </span>
    </Button>
  );
}
