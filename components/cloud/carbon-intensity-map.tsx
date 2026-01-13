"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Globe, Info } from "lucide-react";
import { useState } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
} from "react-simple-maps";
import { match } from "ts-pattern";

export interface RegionCarbonIntensity {
  region: string;
  zone: string;
  provider: string;
  value: number;
  datetime: Date;
  isEstimated: boolean;
}

interface CarbonIntensityMapProps {
  data: RegionCarbonIntensity[];
}

/** AWS region coordinates mapping */
const AWS_REGION_COORDINATES: Record<string, [number, number]> = {
  "us-east-1": [-77.4875, 39.0438],
  "us-east-2": [-82.9988, 39.9612],
  "us-west-1": [-121.8863, 37.3382],
  "us-west-2": [-122.3321, 47.6062],
  "ca-central-1": [-79.3832, 43.6532],
  "eu-west-1": [-6.2603, 53.3498],
  "eu-west-2": [-0.1276, 51.5074],
  "eu-west-3": [2.3522, 48.8566],
  "eu-central-1": [8.6821, 50.1109],
  "eu-north-1": [18.0686, 59.3293],
  "ap-south-1": [72.8777, 19.076],
  "ap-southeast-1": [103.8198, 1.3521],
  "ap-southeast-2": [151.2093, -33.8688],
  "ap-northeast-1": [139.6917, 35.6895],
  "ap-northeast-2": [126.978, 37.5665],
  "sa-east-1": [-46.6333, -23.5505],
};

/** GCP region coordinates mapping */
const GCP_REGION_COORDINATES: Record<string, [number, number]> = {
  "us-central1": [-95.9345, 41.2619],
  "us-east1": [-79.8831, 33.836],
  "us-east4": [-77.4875, 39.0438],
  "us-west1": [-121.8863, 37.3382],
  "us-west2": [-118.2437, 34.0522],
  "europe-west1": [4.4699, 50.4501],
  "europe-west2": [-0.1276, 51.5074],
  "europe-west3": [8.6821, 50.1109],
  "asia-east1": [121.5654, 25.033],
  "asia-northeast1": [139.6917, 35.6895],
  "asia-southeast1": [103.8198, 1.3521],
};

/** Azure region coordinates mapping */
const AZURE_REGION_COORDINATES: Record<string, [number, number]> = {
  eastus: [-79.8831, 37.3719],
  eastus2: [-78.3889, 36.6681],
  westus: [-122.4194, 37.7749],
  westus2: [-119.852, 47.233],
  centralus: [-93.6208, 41.5908],
  northeurope: [-6.2603, 53.3498],
  westeurope: [4.9041, 52.3676],
  uksouth: [-0.1276, 51.5074],
  southeastasia: [103.8198, 1.3521],
  japaneast: [139.6917, 35.6895],
};

/**
 * Gets coordinates for a region based on provider
 */
function getRegionCoordinates(
  region: string,
  provider: string
): [number, number] | undefined {
  return match(provider)
    .with("AWS", () => AWS_REGION_COORDINATES[region])
    .with("GCP", () => GCP_REGION_COORDINATES[region])
    .with("AZURE", () => AZURE_REGION_COORDINATES[region])
    .otherwise(() => undefined);
}

/**
 * Determines color based on carbon intensity value
 * Lower is better (green), higher is worse (red)
 */
function getIntensityColor(value: number): string {
  if (value < 100) return "hsl(142, 76%, 36%)"; // Dark green
  if (value < 200) return "hsl(142, 71%, 45%)"; // Green
  if (value < 300) return "hsl(84, 81%, 44%)"; // Yellow-green
  if (value < 400) return "hsl(45, 93%, 47%)"; // Yellow
  if (value < 500) return "hsl(25, 95%, 53%)"; // Orange
  return "hsl(0, 84%, 60%)"; // Red
}

/**
 * Gets intensity category label
 */
function getIntensityCategory(value: number): string {
  if (value < 100) return "Very Low";
  if (value < 200) return "Low";
  if (value < 300) return "Moderate";
  if (value < 400) return "High";
  if (value < 500) return "Very High";
  return "Extreme";
}

export function CarbonIntensityMap({ data }: CarbonIntensityMapProps) {
  const geoUrl =
    "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

  const regionsWithCoordinates = data
    .map((item) => ({
      ...item,
      coordinates: getRegionCoordinates(item.region, item.provider),
    }))
    .filter((item) => item.coordinates !== undefined);

  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" />
              Today's Global Carbon Intensity Map
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Real-time carbon intensity (gCO₂eq/kWh) across datacenter regions
            </p>
          </div>
          <Badge variant="secondary">
            {regionsWithCoordinates.length} regions
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {/* Legend */}
        <div className="mb-4 p-3 rounded-lg bg-muted/30 flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Intensity Scale:</span>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            {[
              { label: "Very Low", color: "hsl(142, 76%, 36%)" },
              { label: "Low", color: "hsl(142, 71%, 45%)" },
              { label: "Moderate", color: "hsl(84, 81%, 44%)" },
              { label: "High", color: "hsl(45, 93%, 47%)" },
              { label: "Very High", color: "hsl(25, 95%, 53%)" },
              { label: "Extreme", color: "hsl(0, 84%, 60%)" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-1.5">
                <div
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-xs text-muted-foreground">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Map */}
        <div className="relative w-full h-[500px] bg-slate-50 dark:bg-slate-900 rounded-lg overflow-hidden border">
          <ComposableMap
            projection="geoMercator"
            projectionConfig={{
              scale: 147,
              center: [0, 20],
            }}
            style={{ width: "100%", height: "100%" }}
          >
            <Geographies geography={geoUrl}>
              {({ geographies }) =>
                geographies.map((geo) => (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill="hsl(var(--muted))"
                    stroke="hsl(var(--border))"
                    strokeWidth={0.5}
                    style={{
                      default: { outline: "none" },
                      hover: {
                        outline: "none",
                        fill: "hsl(var(--muted-foreground) / 0.1)",
                      },
                      pressed: { outline: "none" },
                    }}
                  />
                ))
              }
            </Geographies>

            {/* Markers for each region */}
            {regionsWithCoordinates.map((item) => (
              <Marker
                key={`${item.provider}-${item.region}`}
                coordinates={item.coordinates!}
              >
                <circle
                  r={10}
                  fill={getIntensityColor(item.value)}
                  stroke="hsl(var(--background))"
                  strokeWidth={2}
                  className="cursor-pointer transition-all duration-200"
                  style={{
                    filter:
                      "drop-shadow(0 2px 4px hsl(var(--shadow-color) / 0.3))",
                  }}
                  onMouseEnter={() =>
                    setHoveredRegion(`${item.provider}-${item.region}`)
                  }
                  onMouseLeave={() => setHoveredRegion(null)}
                />
              </Marker>
            ))}
          </ComposableMap>

          {/* Tooltip overlay */}
          {hoveredRegion && (
            <div className="absolute top-4 left-4 bg-popover border rounded-lg shadow-lg p-3 max-w-xs z-10">
              {regionsWithCoordinates
                .filter(
                  (item) => `${item.provider}-${item.region}` === hoveredRegion
                )
                .map((item) => (
                  <div key={hoveredRegion} className="space-y-1">
                    <p className="font-semibold text-sm">{item.region}</p>
                    <p className="text-xs text-muted-foreground">
                      Provider: {item.provider}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Zone: {item.zone}
                    </p>
                    <div className="pt-1 border-t">
                      <p className="text-sm font-semibold text-primary">
                        {item.value.toFixed(2)} gCO₂eq/kWh
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Category: {getIntensityCategory(item.value)}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          )}

          {/* Source attribution */}
          <div className="absolute bottom-4 right-4 bg-popover/95 border rounded-lg shadow-md p-2 z-10">
            <a
              href="https://www.electricitymaps.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors"
            >
              <Info className="h-3 w-3" />
              <span>Source: Electricity Maps</span>
            </a>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
