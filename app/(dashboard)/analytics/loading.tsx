import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function AnalyticsLoading() {
  return (
    <div className="max-w-7xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="h-9 w-48 bg-muted animate-pulse rounded-md" />
          <div className="h-5 w-96 bg-muted animate-pulse rounded-md" />
        </div>
        <div className="h-10 w-32 bg-muted animate-pulse rounded-md" />
      </div>

      {/* Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[30%]">
                <div className="h-4 w-24 bg-muted animate-pulse rounded-md" />
              </TableHead>
              <TableHead className="w-[15%]">
                <div className="h-4 w-16 bg-muted animate-pulse rounded-md" />
              </TableHead>
              <TableHead className="w-[10%]">
                <div className="h-4 w-16 bg-muted animate-pulse rounded-md" />
              </TableHead>
              <TableHead className="w-[12%]">
                <div className="h-4 w-24 bg-muted animate-pulse rounded-md" />
              </TableHead>
              <TableHead className="w-[8%]">
                <div className="h-4 w-16 bg-muted animate-pulse rounded-md" />
              </TableHead>
              <TableHead className="w-[15%]">
                <div className="h-4 w-28 bg-muted animate-pulse rounded-md" />
              </TableHead>
              <TableHead className="w-[5%]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[1, 2, 3, 4, 5].map((i) => (
              <TableRow key={i}>
                <TableCell>
                  <div className="h-4 w-48 bg-muted animate-pulse rounded-md" />
                </TableCell>
                <TableCell>
                  <div className="h-4 w-32 bg-muted animate-pulse rounded-md" />
                </TableCell>
                <TableCell>
                  <div className="h-6 w-20 bg-muted animate-pulse rounded-full" />
                </TableCell>
                <TableCell>
                  <div className="h-4 w-24 bg-muted animate-pulse rounded-md" />
                </TableCell>
                <TableCell>
                  <div className="h-4 w-16 bg-muted animate-pulse rounded-md" />
                </TableCell>
                <TableCell>
                  <div className="h-4 w-20 bg-muted animate-pulse rounded-md" />
                </TableCell>
                <TableCell>
                  <div className="h-4 w-4 bg-muted animate-pulse rounded-md" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Info Card */}
      <Card className="border-primary/20 bg-accent/30">
        <CardContent className="p-4">
          <div className="space-y-2">
            <div className="h-4 w-64 bg-muted animate-pulse rounded-md" />
            <div className="h-3 w-full bg-muted animate-pulse rounded-md" />
            <div className="h-3 w-3/4 bg-muted animate-pulse rounded-md" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
