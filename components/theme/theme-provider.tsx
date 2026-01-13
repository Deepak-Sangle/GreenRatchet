"use client";

import type { ResolvedTheme, ThemePreference } from "@/lib/theme/theme-config";
import {
  applyTheme,
  createSystemThemeListener,
  getStoredTheme,
  getSystemTheme,
  setStoredTheme,
} from "@/lib/theme/theme-utils";
import { createContext, useEffect, useState } from "react";

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: ThemePreference;
  storageKey?: string;
};

type ThemeProviderState = {
  theme: ThemePreference;
  resolvedTheme: ResolvedTheme;
  systemTheme: ResolvedTheme;
  setTheme: (theme: ThemePreference) => void;
};

const initialState: ThemeProviderState = {
  theme: "system",
  resolvedTheme: "light",
  systemTheme: "light",
  setTheme: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "ui-theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<ThemePreference>(defaultTheme);
  const [systemTheme, setSystemTheme] = useState<ResolvedTheme>("light");
  const [mounted, setMounted] = useState(false);

  // Get resolved theme (what's actually applied)
  const resolvedTheme: ResolvedTheme = theme === "system" ? systemTheme : theme;

  useEffect(() => {
    setMounted(true);

    // Get stored theme preference or use default
    const storedTheme = getStoredTheme(storageKey);
    if (storedTheme) {
      setTheme(storedTheme);
    }

    // Get initial system preference
    const initialSystemTheme = getSystemTheme();
    setSystemTheme(initialSystemTheme);

    // Listen for system preference changes
    const cleanup = createSystemThemeListener((newSystemTheme) => {
      setSystemTheme(newSystemTheme);
    });

    return cleanup;
  }, [storageKey]);

  useEffect(() => {
    if (!mounted) return;
    applyTheme(resolvedTheme);
  }, [resolvedTheme, mounted]);

  const value: ThemeProviderState = {
    theme,
    resolvedTheme,
    systemTheme,
    setTheme: (newTheme: ThemePreference) => {
      setStoredTheme(newTheme, storageKey);
      setTheme(newTheme);
    },
  };

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return <div style={{ visibility: "hidden" }}>{children}</div>;
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export { ThemeProviderContext };
