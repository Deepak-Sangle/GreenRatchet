import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-9 w-48 bg-muted animate-pulse rounded-md" />
          <div className="h-5 w-64 bg-muted animate-pulse rounded-md" />
        </div>
        <div className="h-10 w-40 bg-muted animate-pulse rounded-md" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 w-24 bg-muted animate-pulse rounded-md" />
              <div className="h-4 w-4 bg-muted animate-pulse rounded-full" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-16 bg-muted animate-pulse rounded-md mb-2" />
              <div className="h-3 w-32 bg-muted animate-pulse rounded-md" />
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <div className="h-6 w-48 bg-muted animate-pulse rounded-md mb-2" />
          <div className="h-4 w-80 bg-muted animate-pulse rounded-md" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="space-y-2 flex-1">
                  <div className="h-5 w-48 bg-muted animate-pulse rounded-md" />
                  <div className="h-4 w-64 bg-muted animate-pulse rounded-md" />
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-6 w-16 bg-muted animate-pulse rounded-full" />
                  <div className="h-6 w-20 bg-muted animate-pulse rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
