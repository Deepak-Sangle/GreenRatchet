import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function CloudUsageLoading() {
  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-pulse">
      {/* Header skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="h-9 w-48 bg-muted rounded" />
          <div className="h-5 w-80 bg-muted rounded mt-2" />
        </div>
        <div className="h-10 w-24 bg-muted rounded" />
      </div>

      {/* Filter card skeleton */}
      <Card>
        <CardHeader className="pb-4">
          <div className="h-6 w-24 bg-muted rounded" />
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <div className="h-4 w-20 bg-muted rounded" />
            <div className="flex gap-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-8 w-20 bg-muted rounded-full" />
              ))}
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 w-24 bg-muted rounded" />
                <div className="h-10 w-full bg-muted rounded" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Summary cards skeleton */}
      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="h-4 w-20 bg-muted rounded" />
              <div className="h-4 w-4 bg-muted rounded" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-32 bg-muted rounded" />
              <div className="h-3 w-24 bg-muted rounded mt-2" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Chart skeleton */}
      <Card>
        <CardHeader>
          <div className="h-6 w-48 bg-muted rounded" />
          <div className="h-4 w-72 bg-muted rounded mt-1" />
        </CardHeader>
        <CardContent>
          <div className="h-[400px] w-full bg-muted rounded" />
        </CardContent>
      </Card>
    </div>
  );
}
