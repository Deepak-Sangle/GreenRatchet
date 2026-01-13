import * as fc from "fast-check";

// Theme-related arbitraries for property-based testing
export const themeArbitraries = {
  // Generate theme preference values
  themePreference: fc.constantFrom("light", "dark", "system"),

  // Generate resolved theme values (no 'system')
  resolvedTheme: fc.constantFrom("light", "dark"),

  // Generate storage keys
  storageKey: fc.constantFrom(
    "theme",
    "app-theme",
    "user-preference",
    "dark-mode"
  ),

  // Generate boolean for system preference
  systemPreference: fc.boolean(),

  // Generate CSS custom property names used in the theme system
  cssCustomProperty: fc.constantFrom(
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
    "--destructive",
    "--destructive-foreground"
  ),

  // Generate valid CSS color values
  cssColor: fc.oneof(
    // Hex colors
    fc
      .string({ minLength: 6, maxLength: 6 })
      .filter((s) => /^[0-9a-fA-F]{6}$/.test(s))
      .map((hex) => `#${hex}`),
    // HSL colors
    fc
      .record({
        h: fc.integer({ min: 0, max: 360 }),
        s: fc.integer({ min: 0, max: 100 }),
        l: fc.integer({ min: 0, max: 100 }),
      })
      .map(({ h, s, l }) => `hsl(${h}, ${s}%, ${l}%)`),
    // RGB colors
    fc
      .record({
        r: fc.integer({ min: 0, max: 255 }),
        g: fc.integer({ min: 0, max: 255 }),
        b: fc.integer({ min: 0, max: 255 }),
      })
      .map(({ r, g, b }) => `rgb(${r}, ${g}, ${b})`)
  ),

  // Generate component props that might affect theming
  componentProps: fc.record({
    className: fc.option(fc.string(), { nil: undefined }),
    variant: fc.option(
      fc.constantFrom("default", "outline", "ghost", "destructive"),
      { nil: undefined }
    ),
    size: fc.option(fc.constantFrom("sm", "md", "lg"), { nil: undefined }),
  }),
};

// Generate theme configuration objects (defined separately to avoid circular reference)
export const themeConfigArbitrary = fc.record({
  light: fc.dictionary(
    themeArbitraries.cssCustomProperty,
    themeArbitraries.cssColor
  ),
  dark: fc.dictionary(
    themeArbitraries.cssCustomProperty,
    themeArbitraries.cssColor
  ),
});

// Utility functions for property-based testing
export const propertyTestUtils = {
  // Check if a theme preference is valid
  isValidThemePreference: (
    theme: unknown
  ): theme is "light" | "dark" | "system" => {
    return (
      typeof theme === "string" && ["light", "dark", "system"].includes(theme)
    );
  },

  // Check if a resolved theme is valid
  isValidResolvedTheme: (theme: unknown): theme is "light" | "dark" => {
    return typeof theme === "string" && ["light", "dark"].includes(theme);
  },

  // Check if a CSS custom property name is valid
  isValidCSSProperty: (property: unknown): property is string => {
    return typeof property === "string" && property.startsWith("--");
  },

  // Check if a CSS color value is valid (simplified)
  isValidCSSColor: (color: unknown): color is string => {
    if (typeof color !== "string") return false;
    return (
      color.startsWith("#") ||
      color.startsWith("rgb(") ||
      color.startsWith("hsl(") ||
      color.startsWith("rgba(") ||
      color.startsWith("hsla(")
    );
  },

  // Generate a mock localStorage implementation
  createMockLocalStorage: () => {
    const store: Record<string, string> = {};
    return {
      getItem: jest.fn((key: string) => store[key] || null),
      setItem: jest.fn((key: string, value: string) => {
        store[key] = value;
      }),
      removeItem: jest.fn((key: string) => {
        delete store[key];
      }),
      clear: jest.fn(() => {
        Object.keys(store).forEach((key) => delete store[key]);
      }),
    };
  },

  // Generate a mock matchMedia implementation
  createMockMatchMedia: (prefersDark: boolean) => {
    return jest.fn().mockImplementation((query) => ({
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
  },
};

// Configuration for property-based tests
export const propertyTestConfig = {
  // Number of test cases to run (minimum 100 as specified in design)
  numRuns: 100,

  // Timeout for individual property tests
  timeout: 5000,

  // Seed for reproducible tests (can be overridden)
  seed: 42,

  // Verbose output for debugging
  verbose: false,

  // Enable shrinking to find minimal failing cases
  shrink: true,
};

// Helper to run property-based tests with consistent configuration
export function runPropertyTest<T>(
  name: string,
  arbitrary: fc.Arbitrary<T>,
  predicate: (value: T) => boolean | void,
  options: Partial<typeof propertyTestConfig> = {}
) {
  const config = { ...propertyTestConfig, ...options };

  return fc.assert(fc.property(arbitrary, predicate), {
    numRuns: config.numRuns,
    timeout: config.timeout,
    seed: config.seed,
    verbose: config.verbose,
  });
}

// Export fast-check for direct use
export { fc };
