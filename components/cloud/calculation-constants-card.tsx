import { AWS_CLOUD_CONSTANTS } from "@/lib/constants";
import {
  calculateAverageEmissionsFactor,
  calculateAveragePUE,
  exportConstantsToCSV,
  getRelevantEmissionsFactors,
} from "@/lib/utils/usage";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@radix-ui/react-tooltip";
import { FileSpreadsheet, Info } from "lucide-react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

export function CalculationConstantsCard({
  availableRegions,
}: {
  availableRegions: string[];
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5 text-primary" />
              Calculation Methodology
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Constants used for carbon footprint calculations
            </p>
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                variant="outline"
                onClick={() => exportConstantsToCSV(availableRegions)}
                className="gap-2"
              >
                <FileSpreadsheet className="h-4 w-4" />
                Export
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Download calculation constants as CSV</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Key Constants */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-foreground">
            Key Constants
          </h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex flex-col p-2 rounded-md bg-muted/30">
              <span className="text-muted-foreground">
                Average Power Usage Effectiveness (PUE)
              </span>
              <span className="font-medium text-foreground">
                {calculateAveragePUE(availableRegions).toFixed(2)}
              </span>
            </div>
            <div className="flex flex-col p-2 rounded-md bg-muted/30">
              <span className="text-muted-foreground">
                Avg Emissions Factor (Active Regions)
              </span>
              <span className="font-medium text-foreground">
                {calculateAverageEmissionsFactor(availableRegions).toFixed(7)}{" "}
                mtCO₂e/kWh
              </span>
            </div>
            <div className="flex flex-col p-2 rounded-md bg-muted/30">
              <span className="text-muted-foreground">Memory Coefficient</span>
              <span className="font-medium text-foreground">
                {AWS_CLOUD_CONSTANTS.MEMORY_COEFFICIENT} kWh/GB
              </span>
            </div>
            <div className="flex flex-col p-2 rounded-md bg-muted/30">
              <span className="text-muted-foreground">SSD Coefficient</span>
              <span className="font-medium text-foreground">
                {AWS_CLOUD_CONSTANTS.SSDCOEFFICIENT} Wh/TB
              </span>
            </div>
          </div>
        </div>

        {/* Regional Emissions Factors */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-foreground flex items-center justify-between">
            <span>Emissions Factors (Active Regions)</span>
            <Badge variant="secondary" className="text-xs">
              {availableRegions.length} regions
            </Badge>
          </h4>
          <div className="max-h-32 overflow-y-auto space-y-1 pr-2">
            {getRelevantEmissionsFactors(availableRegions)
              .slice(0, 8)
              .map(({ region, factor }) => (
                <div
                  key={region}
                  className="flex items-center justify-between text-xs p-1.5 rounded hover:bg-muted/30 transition-colors"
                >
                  <span className="text-muted-foreground font-mono">
                    {region}
                  </span>
                  <span className="font-medium text-foreground">
                    {factor.toFixed(7)} mtCO₂e/kWh
                  </span>
                </div>
              ))}
            {availableRegions.length > 8 && (
              <p className="text-xs text-muted-foreground italic pt-1">
                +{availableRegions.length - 8} more regions (export for full
                list)
              </p>
            )}
          </div>
        </div>

        {/* Methodology Note */}
        <div className="pt-2 border-t text-xs text-muted-foreground">
          <p>
            Calculations use region-specific grid carbon intensity and PUE.
            Export for full methodology details.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
