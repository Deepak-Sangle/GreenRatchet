import type { ResolvedTheme, ThemePreference } from "./theme-config";

/**
 * Gets the system theme preference
 */
export function getSystemTheme(): ResolvedTheme {
  if (typeof window === "undefined") return "light";

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

/**
 * Resolves a theme preference to an actual theme
 */
export function resolveTheme(theme: ThemePreference): ResolvedTheme {
  if (theme === "system") {
    return getSystemTheme();
  }
  return theme;
}

/**
 * Gets the stored theme preference from localStorage
 */
export function getStoredTheme(
  storageKey: string = "ui-theme"
): ThemePreference | null {
  if (typeof window === "undefined") return null;

  try {
    const stored = localStorage.getItem(storageKey);
    if (stored && ["light", "dark", "system"].includes(stored)) {
      return stored as ThemePreference;
    }
  } catch (error) {
    console.warn("Failed to read theme from localStorage:", error);
  }

  return null;
}

/**
 * Stores the theme preference in localStorage
 */
export function setStoredTheme(
  theme: ThemePreference,
  storageKey: string = "ui-theme"
): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(storageKey, theme);
  } catch (error) {
    console.warn("Failed to store theme in localStorage:", error);
  }
}

/**
 * Applies the theme class to the document element
 */
export function applyTheme(theme: ResolvedTheme): void {
  if (typeof window === "undefined") return;

  const root = window.document.documentElement;
  root.classList.remove("light", "dark");
  root.classList.add(theme);
}

/**
 * Creates a media query listener for system theme changes
 */
export function createSystemThemeListener(
  callback: (theme: ResolvedTheme) => void
): () => void {
  if (typeof window === "undefined") return () => {};

  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

  const handleChange = (e: MediaQueryListEvent) => {
    callback(e.matches ? "dark" : "light");
  };

  mediaQuery.addEventListener("change", handleChange);

  return () => mediaQuery.removeEventListener("change", handleChange);
}
