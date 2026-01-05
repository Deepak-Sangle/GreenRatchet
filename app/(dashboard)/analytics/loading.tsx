import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function AnalyticsLoading() {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="space-y-2">
        <div className="h-9 w-48 bg-muted animate-pulse rounded-md" />
        <div className="h-5 w-96 bg-muted animate-pulse rounded-md" />
      </div>

      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="h-6 w-64 bg-muted animate-pulse rounded-md" />
                  <div className="h-4 w-80 bg-muted animate-pulse rounded-md" />
                </div>
                <div className="h-6 w-20 bg-muted animate-pulse rounded-full" />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                {[1, 2, 3].map((j) => (
                  <div key={j} className="space-y-2">
                    <div className="h-4 w-24 bg-muted animate-pulse rounded-md" />
                    <div className="h-8 w-32 bg-muted animate-pulse rounded-md" />
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <div className="h-4 w-40 bg-muted animate-pulse rounded-md" />
                <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                  <div className="h-3 w-full bg-muted animate-pulse rounded-md" />
                  <div className="h-3 w-3/4 bg-muted animate-pulse rounded-md" />
                </div>
              </div>

              <div className="grid gap-2 md:grid-cols-2">
                <div className="h-4 w-48 bg-muted animate-pulse rounded-md" />
                <div className="h-4 w-40 bg-muted animate-pulse rounded-md" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-primary/20 bg-accent/30">
        <CardHeader>
          <div className="h-5 w-80 bg-muted animate-pulse rounded-md" />
        </CardHeader>
        <CardContent>
          <div className="h-12 w-full bg-muted animate-pulse rounded-md" />
        </CardContent>
      </Card>
    </div>
  );
}
