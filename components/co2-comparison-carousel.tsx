"use client";

import { cn } from "@/lib/utils";
import {
  Car,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Fuel,
  Home,
  Plane,
  Smartphone,
  Sprout,
} from "lucide-react";
import { useCallback, useRef, useState } from "react";

/** Comparison types for CO2 equivalencies */
export type ComparisonType =
  | "flights"
  | "homes"
  | "diesel"
  | "trees"
  | "miles"
  | "smartphones";

export interface ComparisonConfig {
  type: ComparisonType;
  label: string;
  icon: React.ReactNode;
  unit: string;
  conversionFactor: number; // per metric ton CO2
  description: string;
  sourceUrl: string;
}

export const COMPARISON_CONFIGS: ComparisonConfig[] = [
  {
    type: "flights",
    label: "Flights",
    icon: <Plane className="h-5 w-5" />,
    unit: "flights",
    conversionFactor: 1.2345679,
    description: "Direct one-way flights from NYC to London",
    sourceUrl: "https://calculator.carbonfootprint.com/calculator.aspx?tab=3",
  },
  {
    type: "homes",
    label: "Homes",
    icon: <Home className="h-5 w-5" />,
    unit: "homes",
    conversionFactor: 0.208,
    description: "Homes' electricity use for one year",
    sourceUrl:
      "https://www.epa.gov/energy/greenhouse-gas-equivalencies-calculator#results",
  },
  {
    type: "diesel",
    label: "Diesel",
    icon: <Fuel className="h-5 w-5" />,
    unit: "gallons",
    conversionFactor: 98.2,
    description: "Gallons of diesel consumed",
    sourceUrl:
      "https://www.epa.gov/energy/greenhouse-gas-equivalencies-calculator#results",
  },
  {
    type: "trees",
    label: "Tree Seedlings",
    icon: <Sprout className="h-5 w-5" />,
    unit: "seedlings",
    conversionFactor: 16.5,
    description: "Tree seedlings grown for 10 years",
    sourceUrl:
      "https://www.epa.gov/energy/greenhouse-gas-equivalencies-calculator#results",
  },
  {
    type: "miles",
    label: "Miles Driven",
    icon: <Car className="h-5 w-5" />,
    unit: "miles",
    conversionFactor: 2547,
    description:
      "Miles driven by an average gasoline-powered passenger vehicle",
    sourceUrl:
      "https://www.epa.gov/energy/greenhouse-gas-equivalencies-calculator#results",
  },
  {
    type: "smartphones",
    label: "Smartphones Charged",
    icon: <Smartphone className="h-5 w-5" />,
    unit: "charges",
    conversionFactor: 80847,
    description: "Number of smartphones charged",
    sourceUrl:
      "https://www.epa.gov/energy/greenhouse-gas-equivalencies-calculator#results",
  },
];

/**
 * Calculates comparison value based on CO2e (in metric tons) and comparison type
 */
function calculateComparison(
  mtCo2e: number,
  comparisonType: ComparisonType
): number {
  const config = COMPARISON_CONFIGS.find((c) => c.type === comparisonType);
  if (!config) return 0;

  // CO2e is already in metric tons, no conversion needed
  return mtCo2e * config.conversionFactor;
}

/**
 * Formats comparison value for display
 */
export function formatValueWithUnit(value: number, unit: string): string {
  if (value === 0) {
    return `0 ${unit}`;
  } else if (value < 0.01) {
    return `${value.toFixed(5)} ${unit}`;
  } else if (value < 1) {
    return `${value.toFixed(2)} ${unit}`;
  } else if (value < 1000) {
    return `${value.toFixed(1)} ${unit}`;
  }
  return `${value.toLocaleString(undefined, { maximumFractionDigits: 1 })} ${unit}`;
}

interface CO2ComparisonCarouselProps {
  /** Total CO2e emissions in metric tons (mtCO2e) */
  totalCo2e: number;
  /** Currently selected comparison index */
  selectedIndex: number;
  /** Callback when comparison index changes */
  onIndexChange: (index: number) => void;
  /** Function to format CO2e value for display */
  formatCo2e: (value: number) => string;
}

/**
 * Renders the comparison display for a selected comparison type
 */
function renderComparisonDisplay(
  totalCo2e: number,
  comparisonType: ComparisonType,
  formatCo2e: (value: number) => string
): React.ReactNode {
  const config = COMPARISON_CONFIGS.find((c) => c.type === comparisonType);
  if (!config) return null;

  const comparisonValue = calculateComparison(totalCo2e, comparisonType);

  return (
    <div className="rounded-lg border bg-muted/30 p-6">
      <div className="flex items-start gap-4">
        <div className="rounded-full bg-primary/10 p-3">
          <div className="text-primary">{config.icon}</div>
        </div>
        <div className="flex-1 space-y-2">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold">
              {formatValueWithUnit(comparisonValue, config.unit)}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">{config.description}</p>
          <div className="pt-2 border-t space-y-2">
            <p className="text-xs text-muted-foreground">
              Based on{" "}
              <span className="font-medium">{formatCo2e(totalCo2e)}</span> total
              emissions
            </p>
            <a
              href={config.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 transition-colors"
            >
              <span>Source: Carbon Footprint Calculator</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Carousel component for CO2 equivalency comparisons
 * Supports drag/swipe navigation, arrow buttons, and indicator dots
 */
export function CO2ComparisonCarousel({
  totalCo2e,
  selectedIndex,
  onIndexChange,
  formatCo2e,
}: CO2ComparisonCarouselProps) {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const handlePrev = useCallback(() => {
    const newIndex =
      selectedIndex === 0 ? COMPARISON_CONFIGS.length - 1 : selectedIndex - 1;
    onIndexChange(newIndex);
  }, [selectedIndex, onIndexChange]);

  const handleNext = useCallback(() => {
    const newIndex =
      selectedIndex === COMPARISON_CONFIGS.length - 1 ? 0 : selectedIndex + 1;
    onIndexChange(newIndex);
  }, [selectedIndex, onIndexChange]);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      setIsDragging(true);
      setStartX(e.pageX - (carouselRef.current?.offsetLeft ?? 0));
      setScrollLeft(selectedIndex * (carouselRef.current?.clientWidth ?? 0));
    },
    [selectedIndex]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!isDragging || !carouselRef.current) return;
      e.preventDefault();
      const x = e.pageX - (carouselRef.current.offsetLeft ?? 0);
      const walk = (x - startX) * 2;
      const newIndex = Math.round(
        (scrollLeft - walk) / carouselRef.current.clientWidth
      );
      const clampedIndex = Math.max(
        0,
        Math.min(COMPARISON_CONFIGS.length - 1, newIndex)
      );
      if (clampedIndex !== selectedIndex) {
        onIndexChange(clampedIndex);
      }
    },
    [isDragging, startX, scrollLeft, selectedIndex, onIndexChange]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleTouchStart = useCallback(
    (e: React.TouchEvent<HTMLDivElement>) => {
      setIsDragging(true);
      setStartX(e.touches[0].pageX - (carouselRef.current?.offsetLeft ?? 0));
      setScrollLeft(selectedIndex * (carouselRef.current?.clientWidth ?? 0));
    },
    [selectedIndex]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent<HTMLDivElement>) => {
      if (!isDragging || !carouselRef.current) return;
      const x = e.touches[0].pageX - (carouselRef.current.offsetLeft ?? 0);
      const walk = (x - startX) * 2;
      const newIndex = Math.round(
        (scrollLeft - walk) / carouselRef.current.clientWidth
      );
      const clampedIndex = Math.max(
        0,
        Math.min(COMPARISON_CONFIGS.length - 1, newIndex)
      );
      if (clampedIndex !== selectedIndex) {
        onIndexChange(clampedIndex);
      }
    },
    [isDragging, startX, scrollLeft, selectedIndex, onIndexChange]
  );

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  return (
    <div className="relative">
      {/* Navigation Arrows */}
      <button
        type="button"
        onClick={handlePrev}
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 rounded-full bg-background border shadow-soft p-2 hover:bg-muted transition-all duration-200"
        aria-label="Previous comparison"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={handleNext}
        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 rounded-full bg-background border shadow-soft p-2 hover:bg-muted transition-all duration-200"
        aria-label="Next comparison"
      >
        <ChevronRight className="h-4 w-4" />
      </button>

      {/* Carousel Container */}
      <div
        ref={carouselRef}
        className="overflow-hidden rounded-lg"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ cursor: isDragging ? "grabbing" : "grab" }}
      >
        <div
          className="flex transition-transform duration-300 ease-out"
          style={{
            transform: `translateX(-${selectedIndex * 100}%)`,
          }}
        >
          {COMPARISON_CONFIGS.map((config) => (
            <div
              key={config.type}
              className="min-w-full flex-shrink-0"
              style={{ width: "100%" }}
            >
              {renderComparisonDisplay(totalCo2e, config.type, formatCo2e)}
            </div>
          ))}
        </div>
      </div>

      {/* Indicator Dots */}
      <div className="flex justify-center gap-2 mt-4">
        {COMPARISON_CONFIGS.map((config, index) => (
          <button
            key={config.type}
            type="button"
            onClick={() => onIndexChange(index)}
            className={cn(
              "h-2 rounded-full transition-all duration-200",
              index === selectedIndex
                ? "w-8 bg-primary"
                : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
            )}
            aria-label={`Go to ${config.label}`}
          />
        ))}
      </div>
    </div>
  );
}
