import { Prisma } from "@/app/generated/prisma/client";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  KPI_DIRECTION_LABELS,
  KPI_FREQUENCY_LABELS,
  KPI_TYPE_LABELS,
} from "@/lib/labels";
import { getKPIUnit } from "@/lib/utils";
import { TrendingDown, TrendingUp } from "lucide-react";
import { KPIActions } from "./kpi-actions";
import { KPIReviewActions } from "./kpi-review-actions";

export type LoanWithMarginRatchets = Prisma.LoanGetPayload<{
  include: {
    borrowerOrg: true;
    lenderOrg: true;
    marginRatchets: {
      include: {
        kpi: true;
      };
    };
    kpis: {
      include: {
        marginRatchets: true;
      };
    };
  };
}>;

interface KPITableProps {
  kpis: LoanWithMarginRatchets["kpis"];
  loanId: string;
  isBorrower: boolean;
  isLender: boolean;
}

export function KPITable({
  kpis,
  loanId,
  isBorrower,
  isLender,
}: KPITableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[200px] min-w-[200px]">KPI Name</TableHead>
          <TableHead className="w-[120px]">Type</TableHead>
          <TableHead className="w-[100px]">Baseline</TableHead>
          <TableHead className="w-[100px]">Target</TableHead>
          <TableHead className="w-[140px]">Direction</TableHead>
          <TableHead className="w-[120px]">Frequency</TableHead>
          <TableHead className="w-[200px]">Ratchets</TableHead>
          <TableHead className="w-[100px]">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {kpis.map((kpi) => (
          <TableRow key={kpi.id}>
            <TableCell>
              <div>
                <p className="font-medium">{kpi.name}</p>
              </div>
            </TableCell>
            <TableCell>
              <Badge variant="outline">
                {KPI_TYPE_LABELS[kpi.type as keyof typeof KPI_TYPE_LABELS] ??
                  kpi.type}
              </Badge>
            </TableCell>
            <TableCell>
              {kpi.baselineValue?.toString() ?? "—"}
              {kpi.baselineValue && getKPIUnit(kpi) && (
                <span className="ml-1 text-xs text-muted-foreground">
                  {getKPIUnit(kpi)}
                </span>
              )}
            </TableCell>
            <TableCell>
              {kpi.targetValue.toString()}
              {getKPIUnit(kpi) && (
                <span className="ml-1 text-xs text-muted-foreground">
                  {getKPIUnit(kpi)}
                </span>
              )}
            </TableCell>
            <TableCell>
              <span className="flex items-center gap-1 text-sm">
                {kpi.direction === "LOWER_IS_BETTER" ? (
                  <TrendingDown className="h-3 w-3 text-green-600" />
                ) : kpi.direction === "HIGHER_IS_BETTER" ? (
                  <TrendingUp className="h-3 w-3 text-green-600" />
                ) : null}
                {KPI_DIRECTION_LABELS[kpi.direction] ?? kpi.direction}
              </span>
            </TableCell>
            <TableCell>
              {KPI_FREQUENCY_LABELS[kpi.frequency] ?? kpi.frequency}
            </TableCell>
            <TableCell>
              {kpi.marginRatchets?.length > 0 ? (
                <Badge variant="secondary">
                  {kpi.marginRatchets.length} configured
                </Badge>
              ) : (
                <span className="text-muted-foreground text-sm">None</span>
              )}
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-1">
                {isLender && kpi.status === "PROPOSED" && (
                  <KPIReviewActions kpiId={kpi.id} />
                )}
                <KPIActions kpi={kpi} loanId={loanId} isBorrower={isBorrower} />
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
