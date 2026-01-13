/**
 * Accessibility validation utilities for theme compliance
 * Provides functions to validate contrast ratios and WCAG compliance
 */

export type WCAGLevel = "AA" | "AAA";
export type TextSize = "normal" | "large";

/**
 * Color contrast validation result
 */
export interface ContrastResult {
  ratio: number;
  isValid: boolean;
  level: WCAGLevel;
  textSize: TextSize;
  recommendation?: string;
}

/**
 * Theme accessibility validation result
 */
export interface ThemeAccessibilityResult {
  theme: "light" | "dark";
  validCombinations: number;
  totalCombinations: number;
  failedCombinations: Array<{
    foreground: string;
    background: string;
    description: string;
    contrast: ContrastResult;
  }>;
  overallCompliance: boolean;
}

/**
 * Converts HSL color string to RGB values
 */
function hslToRgb(hsl: string): [number, number, number] {
  // Parse HSL string like "152 58% 38%" or "hsl(152, 58%, 38%)"
  const match =
    hsl.match(/(\d+)\s+(\d+)%\s+(\d+)%/) ||
    hsl.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);

  if (!match) {
    throw new Error(`Invalid HSL color format: ${hsl}`);
  }

  const h = parseInt(match[1]) / 360;
  const s = parseInt(match[2]) / 100;
  const l = parseInt(match[3]) / 100;

  const hue2rgb = (p: number, q: number, t: number): number => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };

  let r: number, g: number, b: number;

  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

/**
 * Calculates the relative luminance of a color
 */
function getRelativeLuminance(rgb: [number, number, number]): number {
  const [r, g, b] = rgb.map((c) => {
    const sRGB = c / 255;
    return sRGB <= 0.03928
      ? sRGB / 12.92
      : Math.pow((sRGB + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Calculates the contrast ratio between two colors
 */
export function calculateContrastRatio(
  foreground: string,
  background: string
): number {
  try {
    const fgRgb = hslToRgb(foreground);
    const bgRgb = hslToRgb(background);

    const fgLuminance = getRelativeLuminance(fgRgb);
    const bgLuminance = getRelativeLuminance(bgRgb);

    const lighter = Math.max(fgLuminance, bgLuminance);
    const darker = Math.min(fgLuminance, bgLuminance);

    return (lighter + 0.05) / (darker + 0.05);
  } catch (error) {
    console.warn(
      `Failed to calculate contrast ratio for ${foreground} on ${background}:`,
      error
    );
    return 1; // Assume worst case
  }
}

/**
 * Validates if a contrast ratio meets WCAG standards
 */
export function validateContrast(
  foreground: string,
  background: string,
  level: WCAGLevel = "AA",
  textSize: TextSize = "normal"
): ContrastResult {
  const ratio = calculateContrastRatio(foreground, background);

  // WCAG contrast requirements
  const requirements = {
    AA: { normal: 4.5, large: 3.0 },
    AAA: { normal: 7.0, large: 4.5 },
  };

  const requiredRatio = requirements[level][textSize];
  const isValid = ratio >= requiredRatio;

  let recommendation: string | undefined;
  if (!isValid) {
    const deficit = requiredRatio - ratio;
    recommendation = `Contrast ratio ${ratio.toFixed(2)} is below ${level} standard (${requiredRatio}). Increase by ${deficit.toFixed(2)} to meet requirements.`;
  }

  return {
    ratio: Math.round(ratio * 100) / 100,
    isValid,
    level,
    textSize,
    recommendation,
  };
}

/**
 * Gets CSS custom property value from the document
 */
export function getCSSCustomProperty(
  property: string,
  element?: Element
): string {
  const targetElement = element || document.documentElement;
  const computedStyle = window.getComputedStyle(targetElement);
  return computedStyle.getPropertyValue(property).trim();
}

/**
 * Gets all theme color combinations that need validation
 */
export function getThemeColorCombinations(): Array<{
  foreground: string;
  background: string;
  description: string;
}> {
  return [
    // Primary text combinations
    {
      foreground: "--foreground",
      background: "--background",
      description: "Primary text on background",
    },
    {
      foreground: "--card-foreground",
      background: "--card",
      description: "Card text on card background",
    },
    {
      foreground: "--popover-foreground",
      background: "--popover",
      description: "Popover text on popover background",
    },

    // Interactive element combinations
    {
      foreground: "--primary-foreground",
      background: "--primary",
      description: "Primary button text",
    },
    {
      foreground: "--secondary-foreground",
      background: "--secondary",
      description: "Secondary button text",
    },
    {
      foreground: "--accent-foreground",
      background: "--accent",
      description: "Accent element text",
    },
    {
      foreground: "--destructive-foreground",
      background: "--destructive",
      description: "Destructive button text",
    },

    // Muted text combinations
    {
      foreground: "--muted-foreground",
      background: "--background",
      description: "Muted text on background",
    },
    {
      foreground: "--muted-foreground",
      background: "--card",
      description: "Muted text on card",
    },

    // Form element combinations
    {
      foreground: "--foreground",
      background: "--input",
      description: "Input text",
    },

    // Extended theme combinations
    {
      foreground: "--success-foreground",
      background: "--success",
      description: "Success message text",
    },
    {
      foreground: "--warning-foreground",
      background: "--warning",
      description: "Warning message text",
    },
    {
      foreground: "--info-foreground",
      background: "--info",
      description: "Info message text",
    },
  ];
}

/**
 * Validates all color combinations for a specific theme
 */
export function validateThemeAccessibility(
  theme: "light" | "dark"
): ThemeAccessibilityResult {
  // Apply theme class temporarily if not already applied
  const root = document.documentElement;
  const originalClass = root.className;
  const hasThemeClass = root.classList.contains(theme);

  if (!hasThemeClass) {
    root.classList.remove("light", "dark");
    root.classList.add(theme);
  }

  try {
    const combinations = getThemeColorCombinations();
    const results = combinations.map(
      ({ foreground, background, description }) => {
        const fgColor = getCSSCustomProperty(foreground);
        const bgColor = getCSSCustomProperty(background);

        const contrast = validateContrast(fgColor, bgColor, "AA", "normal");

        return {
          foreground: `${foreground} (${fgColor})`,
          background: `${background} (${bgColor})`,
          description,
          contrast,
        };
      }
    );

    const failedCombinations = results.filter(
      (result) => !result.contrast.isValid
    );
    const validCombinations = results.length - failedCombinations.length;
    const overallCompliance = failedCombinations.length === 0;

    return {
      theme,
      validCombinations,
      totalCombinations: results.length,
      failedCombinations,
      overallCompliance,
    };
  } finally {
    // Restore original class
    if (!hasThemeClass) {
      root.className = originalClass;
    }
  }
}

/**
 * Validates accessibility for both light and dark themes
 */
export function validateAllThemes(): {
  light: ThemeAccessibilityResult;
  dark: ThemeAccessibilityResult;
  overallCompliance: boolean;
} {
  const lightResult = validateThemeAccessibility("light");
  const darkResult = validateThemeAccessibility("dark");

  const overallCompliance =
    lightResult.overallCompliance && darkResult.overallCompliance;

  return {
    light: lightResult,
    dark: darkResult,
    overallCompliance,
  };
}

/**
 * Generates a detailed accessibility report
 */
export function generateAccessibilityReport(): string {
  const results = validateAllThemes();

  let report = "# Theme Accessibility Report\n\n";

  // Overall summary
  report += `## Summary\n`;
  report += `- Overall Compliance: ${results.overallCompliance ? "✅ PASS" : "❌ FAIL"}\n`;
  report += `- Light Theme: ${results.light.overallCompliance ? "✅ PASS" : "❌ FAIL"} (${results.light.validCombinations}/${results.light.totalCombinations})\n`;
  report += `- Dark Theme: ${results.dark.overallCompliance ? "✅ PASS" : "❌ FAIL"} (${results.dark.validCombinations}/${results.dark.totalCombinations})\n\n`;

  // Detailed results for each theme
  for (const [themeName, themeResult] of Object.entries({
    light: results.light,
    dark: results.dark,
  })) {
    report += `## ${themeName.charAt(0).toUpperCase() + themeName.slice(1)} Theme\n\n`;

    if (themeResult.failedCombinations.length === 0) {
      report += "✅ All color combinations meet WCAG AA standards.\n\n";
    } else {
      report += "❌ The following combinations fail WCAG AA standards:\n\n";

      themeResult.failedCombinations.forEach(
        ({ foreground, background, description, contrast }) => {
          report += `### ${description}\n`;
          report += `- **Foreground**: ${foreground}\n`;
          report += `- **Background**: ${background}\n`;
          report += `- **Contrast Ratio**: ${contrast.ratio}:1\n`;
          report += `- **Required**: ${contrast.level === "AA" ? (contrast.textSize === "normal" ? "4.5" : "3.0") : contrast.textSize === "normal" ? "7.0" : "4.5"}:1\n`;
          if (contrast.recommendation) {
            report += `- **Recommendation**: ${contrast.recommendation}\n`;
          }
          report += "\n";
        }
      );
    }
  }

  return report;
}

/**
 * Utility to test contrast for arbitrary colors (useful for testing)
 */
export function testColorContrast(
  foregroundHsl: string,
  backgroundHsl: string,
  level: WCAGLevel = "AA",
  textSize: TextSize = "normal"
): ContrastResult {
  return validateContrast(foregroundHsl, backgroundHsl, level, textSize);
}
