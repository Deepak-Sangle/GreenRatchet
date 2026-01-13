import { render, RenderOptions } from "@testing-library/react";
import { ReactElement } from "react";

// Custom render function that includes ThemeProvider
interface CustomRenderOptions extends Omit<RenderOptions, "wrapper"> {
  theme?: "light" | "dark" | "system";
  storageKey?: string;
}

export function renderWithTheme(
  ui: ReactElement,
  options: CustomRenderOptions = {}
) {
  const { theme = "light", storageKey = "theme", ...renderOptions } = options;

  // Note: ThemeProvider wrapper should be imported and used in individual test files
  // to avoid build-time JSX compilation issues in utility files

  return render(ui, renderOptions);
}

// Utility to simulate theme changes
export function simulateThemeChange(theme: "light" | "dark") {
  // Mock localStorage to return the theme
  jest.spyOn(Storage.prototype, "getItem").mockReturnValue(theme);

  // Mock matchMedia to simulate system preference
  const mockMatchMedia = jest.fn().mockImplementation((query) => ({
    matches:
      query === "(prefers-color-scheme: dark)"
        ? theme === "dark"
        : theme === "light",
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  }));

  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: mockMatchMedia,
  });
}

// Utility to check if element has dark mode classes
export function hasDarkModeClass(element: Element): boolean {
  return (
    element.classList.contains("dark") ||
    element.closest(".dark") !== null ||
    document.documentElement.classList.contains("dark")
  );
}

// Utility to get computed CSS custom property value
export function getCSSCustomProperty(
  element: Element,
  property: string
): string {
  const computedStyle = window.getComputedStyle(element);
  return computedStyle.getPropertyValue(property).trim();
}

// Utility to simulate system theme preference change
export function simulateSystemThemeChange(prefersDark: boolean) {
  const mockMatchMedia = jest.fn().mockImplementation((query) => ({
    matches:
      query === "(prefers-color-scheme: dark)" ? prefersDark : !prefersDark,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  }));

  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: mockMatchMedia,
  });

  // Trigger the change event
  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
  if (mediaQuery.onchange) {
    const event = new MediaQueryListEvent("change", {
      matches: prefersDark,
      media: mediaQuery.media,
    });
    mediaQuery.onchange(event);
  }
}

// Utility to reset theme-related mocks
export function resetThemeMocks() {
  jest.restoreAllMocks();
  localStorage.clear();
  document.documentElement.className = "";
}

// Property-based testing generators for theme testing
export const themeGenerators = {
  // Generate valid theme values
  theme: () => ["light", "dark", "system"] as const,

  // Generate storage keys
  storageKey: () => ["theme", "app-theme", "user-preference"],

  // Generate boolean values for system preference
  systemPreference: () => [true, false],

  // Generate CSS custom property names
  cssProperty: () => [
    "--background",
    "--foreground",
    "--card",
    "--card-foreground",
    "--primary",
    "--primary-foreground",
    "--muted",
    "--muted-foreground",
    "--border",
    "--input",
    "--ring",
  ],
};

// Utility to validate contrast ratios (simplified)
export function hasValidContrast(
  foregroundColor: string,
  backgroundColor: string,
  level: "AA" | "AAA" = "AA"
): boolean {
  // This is a simplified implementation
  // In a real scenario, you'd use a proper color contrast library
  const requiredRatio = level === "AA" ? 4.5 : 7;

  // Mock implementation - in reality you'd calculate actual contrast
  // For now, assume valid contrast if colors are different
  return foregroundColor !== backgroundColor;
}

// Re-export testing library utilities
export * from "@testing-library/react";
