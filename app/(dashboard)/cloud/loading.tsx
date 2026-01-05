import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function CloudLoading() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="space-y-2">
        <div className="h-9 w-64 bg-muted animate-pulse rounded-md" />
        <div className="h-5 w-96 bg-muted animate-pulse rounded-md" />
      </div>

      <Card className="border-primary/20 bg-accent/30">
        <CardHeader>
          <div className="h-5 w-80 bg-muted animate-pulse rounded-md" />
        </CardHeader>
        <CardContent>
          <div className="h-12 w-full bg-muted animate-pulse rounded-md" />
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {[1, 2].map((i) => (
          <Card key={i}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 bg-muted animate-pulse rounded-lg" />
                <div className="space-y-2">
                  <div className="h-5 w-48 bg-muted animate-pulse rounded-md" />
                  <div className="h-4 w-40 bg-muted animate-pulse rounded-md" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="h-5 w-5 bg-muted animate-pulse rounded-full" />
                  <div className="h-4 w-32 bg-muted animate-pulse rounded-md" />
                </div>
                <div className="space-y-2">
                  <div className="h-4 w-full bg-muted animate-pulse rounded-md" />
                  <div className="h-4 w-3/4 bg-muted animate-pulse rounded-md" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <div className="h-6 w-80 bg-muted animate-pulse rounded-md" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 w-64 bg-muted animate-pulse rounded-md" />
              <div className="h-4 w-full bg-muted animate-pulse rounded-md" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
