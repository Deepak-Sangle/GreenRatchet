import {
  calculateContrastRatio,
  generateAccessibilityReport,
  getCSSCustomProperty,
  getThemeColorCombinations,
  testColorContrast,
  validateAllThemes,
  validateContrast,
  validateThemeAccessibility,
} from "../accessibility-utils";

// Mock DOM methods
const mockGetComputedStyle = jest.fn();
Object.defineProperty(window, "getComputedStyle", {
  value: mockGetComputedStyle,
});

// Mock document.documentElement
const mockDocumentElement = {
  className: "",
  classList: {
    contains: jest.fn(),
    remove: jest.fn(),
    add: jest.fn(),
  },
};

Object.defineProperty(document, "documentElement", {
  value: mockDocumentElement,
  writable: true,
});

describe("accessibility-utils", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockDocumentElement.className = "";
    mockGetComputedStyle.mockReturnValue({
      getPropertyValue: jest.fn().mockReturnValue(""),
    });
  });

  describe("calculateContrastRatio", () => {
    it("should calculate correct contrast ratio for high contrast colors", () => {
      // Black text on white background should have high contrast
      const ratio = calculateContrastRatio("0 0% 0%", "0 0% 100%");
      expect(ratio).toBeCloseTo(21, 0); // Perfect contrast ratio
    });

    it("should calculate correct contrast ratio for low contrast colors", () => {
      // Similar colors should have low contrast
      const ratio = calculateContrastRatio("0 0% 50%", "0 0% 55%");
      expect(ratio).toBeLessThan(2);
    });

    it("should handle HSL format without hsl() wrapper", () => {
      const ratio = calculateContrastRatio("152 58% 38%", "150 20% 98%");
      expect(ratio).toBeGreaterThan(1);
    });

    it("should handle HSL format with hsl() wrapper", () => {
      const ratio = calculateContrastRatio(
        "hsl(152, 58%, 38%)",
        "hsl(150, 20%, 98%)"
      );
      expect(ratio).toBeGreaterThan(1);
    });

    it("should handle invalid color formats gracefully", () => {
      const ratio = calculateContrastRatio("invalid-color", "0 0% 100%");
      expect(ratio).toBe(1); // Should return worst case
    });
  });

  describe("validateContrast", () => {
    it("should validate high contrast colors as passing AA normal", () => {
      const result = validateContrast("0 0% 0%", "0 0% 100%", "AA", "normal");
      expect(result.isValid).toBe(true);
      expect(result.ratio).toBeCloseTo(21, 0);
      expect(result.level).toBe("AA");
      expect(result.textSize).toBe("normal");
      expect(result.recommendation).toBeUndefined();
    });

    it("should validate low contrast colors as failing AA normal", () => {
      const result = validateContrast("0 0% 50%", "0 0% 55%", "AA", "normal");
      expect(result.isValid).toBe(false);
      expect(result.ratio).toBeLessThan(4.5);
      expect(result.recommendation).toContain("below AA standard");
    });

    it("should have different requirements for large text", () => {
      // A color combination that fails normal but passes large
      const normalResult = validateContrast(
        "0 0% 30%",
        "0 0% 70%",
        "AA",
        "normal"
      );
      const largeResult = validateContrast(
        "0 0% 30%",
        "0 0% 70%",
        "AA",
        "large"
      );

      // Large text has lower requirements (3.0 vs 4.5)
      expect(normalResult.isValid).toBe(false);
      expect(largeResult.isValid).toBe(true);
    });

    it("should have stricter requirements for AAA level", () => {
      // A color combination that passes AA but fails AAA
      // Using colors with contrast ratio around 5-6 (passes AA 4.5, fails AAA 7.0)
      const aaResult = validateContrast("0 0% 25%", "0 0% 80%", "AA", "normal");
      const aaaResult = validateContrast(
        "0 0% 25%",
        "0 0% 80%",
        "AAA",
        "normal"
      );

      expect(aaResult.isValid).toBe(true);
      expect(aaaResult.isValid).toBe(false);
    });
  });

  describe("testColorContrast", () => {
    it("should be an alias for validateContrast", () => {
      const result1 = testColorContrast("0 0% 0%", "0 0% 100%");
      const result2 = validateContrast("0 0% 0%", "0 0% 100%");

      expect(result1).toEqual(result2);
    });
  });

  describe("getCSSCustomProperty", () => {
    it("should get CSS custom property value", () => {
      const mockGetPropertyValue = jest.fn().mockReturnValue("  152 58% 38%  ");
      mockGetComputedStyle.mockReturnValue({
        getPropertyValue: mockGetPropertyValue,
      });

      const value = getCSSCustomProperty("--primary");

      expect(mockGetComputedStyle).toHaveBeenCalledWith(
        document.documentElement
      );
      expect(mockGetPropertyValue).toHaveBeenCalledWith("--primary");
      expect(value).toBe("152 58% 38%"); // Should be trimmed
    });

    it("should use provided element instead of document.documentElement", () => {
      const mockElement = document.createElement("div");
      const mockGetPropertyValue = jest.fn().mockReturnValue("test-value");
      mockGetComputedStyle.mockReturnValue({
        getPropertyValue: mockGetPropertyValue,
      });

      getCSSCustomProperty("--test", mockElement);

      expect(mockGetComputedStyle).toHaveBeenCalledWith(mockElement);
    });
  });

  describe("getThemeColorCombinations", () => {
    it("should return array of color combinations", () => {
      const combinations = getThemeColorCombinations();

      expect(Array.isArray(combinations)).toBe(true);
      expect(combinations.length).toBeGreaterThan(0);

      // Check structure of first combination
      expect(combinations[0]).toHaveProperty("foreground");
      expect(combinations[0]).toHaveProperty("background");
      expect(combinations[0]).toHaveProperty("description");
    });

    it("should include essential color combinations", () => {
      const combinations = getThemeColorCombinations();
      const descriptions = combinations.map((c) => c.description);

      expect(descriptions).toContain("Primary text on background");
      expect(descriptions).toContain("Primary button text");
      expect(descriptions).toContain("Card text on card background");
    });
  });

  describe("validateThemeAccessibility", () => {
    beforeEach(() => {
      // Mock CSS custom property values
      const mockGetPropertyValue = jest.fn((prop: string) => {
        const colorMap: Record<string, string> = {
          "--foreground": "160 25% 12%",
          "--background": "150 20% 98%",
          "--primary": "152 58% 38%",
          "--primary-foreground": "0 0% 100%",
          "--card": "0 0% 100%",
          "--card-foreground": "160 25% 12%",
          "--muted-foreground": "160 8% 48%",
          "--input": "150 12% 90%",
          "--secondary": "150 15% 93%",
          "--secondary-foreground": "160 20% 25%",
          "--accent": "155 35% 90%",
          "--accent-foreground": "152 50% 28%",
          "--destructive": "4 74% 49%",
          "--destructive-foreground": "0 0% 100%",
          "--popover": "0 0% 100%",
          "--popover-foreground": "160 25% 12%",
          "--success": "142 76% 36%",
          "--success-foreground": "0 0% 100%",
          "--warning": "38 92% 50%",
          "--warning-foreground": "0 0% 100%",
          "--info": "199 89% 48%",
          "--info-foreground": "0 0% 100%",
        };
        return colorMap[prop] || "0 0% 50%";
      });

      mockGetComputedStyle.mockReturnValue({
        getPropertyValue: mockGetPropertyValue,
      });

      mockDocumentElement.classList.contains.mockReturnValue(false);
    });

    it("should validate theme accessibility", () => {
      const result = validateThemeAccessibility("light");

      expect(result).toHaveProperty("theme", "light");
      expect(result).toHaveProperty("validCombinations");
      expect(result).toHaveProperty("totalCombinations");
      expect(result).toHaveProperty("failedCombinations");
      expect(result).toHaveProperty("overallCompliance");

      expect(typeof result.validCombinations).toBe("number");
      expect(typeof result.totalCombinations).toBe("number");
      expect(Array.isArray(result.failedCombinations)).toBe(true);
      expect(typeof result.overallCompliance).toBe("boolean");
    });

    it("should apply theme class during validation", () => {
      validateThemeAccessibility("dark");

      expect(mockDocumentElement.classList.remove).toHaveBeenCalledWith(
        "light",
        "dark"
      );
      expect(mockDocumentElement.classList.add).toHaveBeenCalledWith("dark");
    });

    it("should not change class if theme is already applied", () => {
      mockDocumentElement.classList.contains.mockReturnValue(true);

      validateThemeAccessibility("light");

      expect(mockDocumentElement.classList.remove).not.toHaveBeenCalled();
      expect(mockDocumentElement.classList.add).not.toHaveBeenCalled();
    });
  });

  describe("validateAllThemes", () => {
    beforeEach(() => {
      // Mock CSS custom property values for both themes
      const mockGetPropertyValue = jest.fn().mockReturnValue("152 58% 38%");
      mockGetComputedStyle.mockReturnValue({
        getPropertyValue: mockGetPropertyValue,
      });
      mockDocumentElement.classList.contains.mockReturnValue(false);
    });

    it("should validate both light and dark themes", () => {
      const result = validateAllThemes();

      expect(result).toHaveProperty("light");
      expect(result).toHaveProperty("dark");
      expect(result).toHaveProperty("overallCompliance");

      expect(result.light.theme).toBe("light");
      expect(result.dark.theme).toBe("dark");
      expect(typeof result.overallCompliance).toBe("boolean");
    });
  });

  describe("generateAccessibilityReport", () => {
    it("should generate a markdown report", () => {
      const report = generateAccessibilityReport();

      expect(typeof report).toBe("string");
      expect(report).toContain("# Theme Accessibility Report");
      expect(report).toContain("## Summary");
    });
  });
});
