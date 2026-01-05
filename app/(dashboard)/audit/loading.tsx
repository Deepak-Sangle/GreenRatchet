import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function AuditLoading() {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="space-y-2">
        <div className="h-9 w-40 bg-muted animate-pulse rounded-md" />
        <div className="h-5 w-96 bg-muted animate-pulse rounded-md" />
      </div>

      <Card>
        <CardHeader>
          <div className="h-6 w-40 bg-muted animate-pulse rounded-md mb-2" />
          <div className="h-4 w-80 bg-muted animate-pulse rounded-md" />
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <div className="h-4 w-16 bg-muted animate-pulse rounded-md" />
                </TableHead>
                <TableHead>
                  <div className="h-4 w-16 bg-muted animate-pulse rounded-md" />
                </TableHead>
                <TableHead>
                  <div className="h-4 w-12 bg-muted animate-pulse rounded-md" />
                </TableHead>
                <TableHead>
                  <div className="h-4 w-20 bg-muted animate-pulse rounded-md" />
                </TableHead>
                <TableHead>
                  <div className="h-4 w-24 bg-muted animate-pulse rounded-md" />
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <TableRow key={i}>
                  <TableCell>
                    <div className="h-5 w-28 bg-muted animate-pulse rounded-full" />
                  </TableCell>
                  <TableCell>
                    <div className="h-4 w-20 bg-muted animate-pulse rounded-md" />
                  </TableCell>
                  <TableCell>
                    <div className="h-4 w-24 bg-muted animate-pulse rounded-md" />
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="h-3 w-32 bg-muted animate-pulse rounded-md" />
                      <div className="h-3 w-28 bg-muted animate-pulse rounded-md" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="h-4 w-32 bg-muted animate-pulse rounded-md" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="border-primary/20 bg-accent/30">
        <CardHeader>
          <div className="h-5 w-48 bg-muted animate-pulse rounded-md" />
        </CardHeader>
        <CardContent>
          <div className="h-12 w-full bg-muted animate-pulse rounded-md" />
        </CardContent>
      </Card>
    </div>
  );
}
