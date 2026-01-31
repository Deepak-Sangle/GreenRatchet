import { getCloudUsageData } from "@/app/actions/cloud";
import { UsageClient } from "@/components/cloud/usage-client";
import {
  AggregationPeriodSchema,
  CloudServices,
  CloudServiceSchema,
  TimeRangeSchema,
} from "@/lib/constants";
import { CloudUsageFilterInput } from "@/lib/validations/cloud";
import z from "zod";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}

export default async function CloudUsagePage({ searchParams }: PageProps) {
  const params = await searchParams;

  console.log(params);

  // Parse filters from search params
  const filters: CloudUsageFilterInput = {
    services: z.array(CloudServiceSchema).safeParse(params.services?.split(","))
      .data ?? [...CloudServices],
    regions:
      z.array(z.string()).safeParse(params.regions?.split(",")).data ?? [],
    timeRange: TimeRangeSchema.safeParse(params.timeRange).data ?? "30d",
    startDate: z.coerce.date().safeParse(params.startDate).data ?? undefined,
    endDate: z.coerce.date().safeParse(params.endDate).data ?? undefined,
    aggregation:
      AggregationPeriodSchema.safeParse(params.aggregation).data ?? "day",
  };

  const { data } = await getCloudUsageData(filters);

  return <UsageClient initialData={data ?? null} initialFilters={filters} />;
}
