"use client";

import type { ResolvedTheme, ThemePreference } from "@/lib/theme/theme-utils";
import { useContext } from "react";
import { ThemeProviderContext } from "./theme-provider";

export interface UseThemeReturn {
  theme: ThemePreference;
  resolvedTheme: ResolvedTheme;
  systemTheme: ResolvedTheme;
  setTheme: (theme: ThemePreference) => void;
}

export const useTheme = (): UseThemeReturn => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }

  return context;
};
