export type ThemeConfig = {
  colors: {
    light: Record<string, string>;
    dark: Record<string, string>;
  };
  shadows: {
    light: Record<string, string>;
    dark: Record<string, string>;
  };
};

export type ThemePreference = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

export const defaultThemeConfig: ThemeConfig = {
  colors: {
    light: {
      background: "150 20% 98%",
      foreground: "160 25% 12%",
      card: "0 0% 100%",
      "card-foreground": "160 25% 12%",
      popover: "0 0% 100%",
      "popover-foreground": "160 25% 12%",
      primary: "152 58% 38%",
      "primary-foreground": "0 0% 100%",
      secondary: "150 15% 93%",
      "secondary-foreground": "160 20% 25%",
      muted: "150 12% 94%",
      "muted-foreground": "160 8% 48%",
      accent: "155 35% 90%",
      "accent-foreground": "152 50% 28%",
      destructive: "4 74% 49%",
      "destructive-foreground": "0 0% 100%",
      border: "150 12% 88%",
      input: "150 12% 90%",
      ring: "152 58% 38%",
    },
    dark: {
      background: "160 25% 6%",
      foreground: "150 15% 95%",
      card: "160 20% 8%",
      "card-foreground": "150 15% 95%",
      popover: "160 20% 8%",
      "popover-foreground": "150 15% 95%",
      primary: "152 55% 48%",
      "primary-foreground": "160 30% 6%",
      secondary: "160 15% 14%",
      "secondary-foreground": "150 15% 90%",
      muted: "160 15% 14%",
      "muted-foreground": "155 10% 60%",
      accent: "155 25% 16%",
      "accent-foreground": "152 50% 70%",
      destructive: "4 65% 40%",
      "destructive-foreground": "0 0% 100%",
      border: "160 15% 16%",
      input: "160 15% 16%",
      ring: "152 55% 48%",
    },
  },
  shadows: {
    light: {
      soft: "0 2px 8px -2px rgba(0, 0, 0, 0.05), 0 4px 16px -4px rgba(0, 0, 0, 0.08)",
      "soft-lg":
        "0 4px 12px -2px rgba(0, 0, 0, 0.06), 0 8px 24px -4px rgba(0, 0, 0, 0.1)",
      glow: "0 0 20px -5px hsl(var(--primary) / 0.3)",
    },
    dark: {
      soft: "0 2px 8px -2px rgba(0, 0, 0, 0.3), 0 4px 16px -4px rgba(0, 0, 0, 0.4)",
      "soft-lg":
        "0 4px 12px -2px rgba(0, 0, 0, 0.4), 0 8px 24px -4px rgba(0, 0, 0, 0.5)",
      glow: "0 0 20px -5px hsl(var(--primary) / 0.4)",
    },
  },
};
