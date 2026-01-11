/**
 * ElectricityMaps Data Sync Service
 * Fetches and stores grid energy data for each region/provider combination
 */ 

import { ElectricityMapsProvider } from "@/app/generated/prisma/enums";
import { prisma } from "@/lib/prisma";
import {
  formatDateTimeForAPI,
  getCarbonFreeEnergy,
  getCarbonIntensityFossilOnly,
  getElectricityMix,
  getRenewableEnergy,
} from "./electricity-maps";

type PrismaProvider = ElectricityMapsProvider;

interface SyncParams {
  dataCenterRegion: string;
  dataCenterProvider: PrismaProvider;
  date: Date;
}

interface SyncResult {
  success: boolean;
  error?: string;
}

function toEstimationMethodEnum(method: string | null): string | null {
  return method?.toUpperCase().replace(/-/g, "_") ?? null;
}

function toTemporalGranularityEnum(granularity: string | null): string | null {
  return granularity?.toUpperCase() ?? null;
}

function toLowercaseProvider(
  provider: PrismaProvider
): ElectricityMapsProvider {
  return provider.toLowerCase() as ElectricityMapsProvider;
}

async function hasExistingDataForDate(
  dataCenterRegion: string,
  dataCenterProvider: PrismaProvider,
  date: Date
): Promise<boolean> {
  const where = { dataCenterRegion, dataCenterProvider, datetime: date };

  const [carbonFree, renewable, carbonIntensity, electricityMix] =
    await Promise.all([
      prisma.gridCarbonFreeEnergy.findFirst({ where, select: { id: true } }),
      prisma.gridRenewableEnergy.findFirst({ where, select: { id: true } }),
      prisma.gridCarbonIntensity.findFirst({ where, select: { id: true } }),
      prisma.gridElectricityMix.findFirst({ where, select: { id: true } }),
    ]);

  return !!carbonFree && !!renewable && !!carbonIntensity && !!electricityMix;
}

async function syncCarbonFreeEnergy(params: SyncParams): Promise<SyncResult> {
  const response = await getCarbonFreeEnergy({
    dataCenterRegion: params.dataCenterRegion,
    dataCenterProvider: toLowercaseProvider(params.dataCenterProvider),
    datetime: formatDateTimeForAPI(params.date),
  });

  const upsertBlock = {
    zone: response.zone,
    dataCenterRegion: params.dataCenterRegion,
    dataCenterProvider: params.dataCenterProvider,
    datetime: new Date(response.datetime),
    value: response.value,
    isEstimated: response.isEstimated ?? false,
    estimationMethod: toEstimationMethodEnum(response.estimationMethod),
    temporalGranularity: toTemporalGranularityEnum(
      response.temporalGranularity
    ),
    apiUpdatedAt: new Date(response.updatedAt),
    apiCreatedAt: new Date(response.createdAt),
  };

  await prisma.gridCarbonFreeEnergy.upsert({
    where: {
      dataCenterRegion_dataCenterProvider_datetime: {
        dataCenterRegion: params.dataCenterRegion,
        dataCenterProvider: params.dataCenterProvider,
        datetime: new Date(response.datetime),
      },
    },
    update: upsertBlock,
    create: upsertBlock,
  });

  return { success: true };
}

async function syncRenewableEnergy(params: SyncParams): Promise<SyncResult> {
  const response = await getRenewableEnergy({
    dataCenterRegion: params.dataCenterRegion,
    dataCenterProvider: toLowercaseProvider(params.dataCenterProvider),
    datetime: formatDateTimeForAPI(params.date),
  });

  const upsertBlock = {
    zone: response.zone,
    dataCenterRegion: params.dataCenterRegion,
    dataCenterProvider: params.dataCenterProvider,
    datetime: new Date(response.datetime),
    value: response.value,
    isEstimated: response.isEstimated ?? false,
    estimationMethod: toEstimationMethodEnum(response.estimationMethod),
    temporalGranularity: toTemporalGranularityEnum(
      response.temporalGranularity
    ),
    apiUpdatedAt: new Date(response.updatedAt),
    apiCreatedAt: new Date(response.createdAt),
  };

  await prisma.gridRenewableEnergy.upsert({
    where: {
      dataCenterRegion_dataCenterProvider_datetime: {
        dataCenterRegion: params.dataCenterRegion,
        dataCenterProvider: params.dataCenterProvider,
        datetime: new Date(response.datetime),
      },
    },
    update: upsertBlock,
    create: upsertBlock,
  });

  return { success: true };
}

async function syncCarbonIntensity(params: SyncParams): Promise<SyncResult> {
  const response = await getCarbonIntensityFossilOnly({
    dataCenterRegion: params.dataCenterRegion,
    dataCenterProvider: toLowercaseProvider(params.dataCenterProvider),
    datetime: formatDateTimeForAPI(params.date),
  });

  const dataPoint = response.data[0];
  if (!dataPoint) {
    return { success: false, error: "No carbon intensity data returned" };
  }

  const upsertBlock = {
    zone: response.zone,
    dataCenterRegion: params.dataCenterRegion,
    dataCenterProvider: params.dataCenterProvider,
    datetime: new Date(dataPoint.datetime),
    value: dataPoint.value,
    emissionFactorType: dataPoint.emissionFactorType,
    isEstimated: dataPoint.isEstimated ?? false,
    estimationMethod: toEstimationMethodEnum(dataPoint.estimationMethod),
    temporalGranularity: toTemporalGranularityEnum(
      response.temporalGranularity
    ),
    apiUpdatedAt: new Date(dataPoint.updatedAt),
    apiCreatedAt: new Date(dataPoint.createdAt),
  };

  await prisma.gridCarbonIntensity.upsert({
    where: {
      dataCenterRegion_dataCenterProvider_datetime: {
        dataCenterRegion: params.dataCenterRegion,
        dataCenterProvider: params.dataCenterProvider,
        datetime: new Date(dataPoint.datetime),
      },
    },
    update: upsertBlock,
    create: upsertBlock,
  });

  return { success: true };
}

async function syncElectricityMix(params: SyncParams): Promise<SyncResult> {
  const response = await getElectricityMix({
    dataCenterRegion: params.dataCenterRegion,
    dataCenterProvider: toLowercaseProvider(params.dataCenterProvider),
    datetime: formatDateTimeForAPI(params.date),
  });

  const dataPoint = response.data.at(0);
  if (!dataPoint) {
    return { success: false, error: "No electricity mix data returned" };
  }

  const upsertBlock = {
    zone: response.zone,
    dataCenterRegion: params.dataCenterRegion,
    dataCenterProvider: params.dataCenterProvider,
    datetime: new Date(dataPoint.datetime),
    nuclear: dataPoint.mix.nuclear,
    geothermal: dataPoint.mix.geothermal,
    biomass: dataPoint.mix.biomass,
    coal: dataPoint.mix.coal,
    wind: dataPoint.mix.wind,
    solar: dataPoint.mix.solar,
    hydro: dataPoint.mix.hydro,
    gas: dataPoint.mix.gas,
    oil: dataPoint.mix.oil,
    unknown: dataPoint.mix.unknown,
    hydroDischarge: dataPoint.mix["hydro discharge"],
    batteryDischarge: dataPoint.mix["battery discharge"],
    isEstimated: dataPoint.isEstimated ?? false,
    estimationMethod: toEstimationMethodEnum(dataPoint.estimationMethod),
    temporalGranularity: toTemporalGranularityEnum(
      response.temporalGranularity
    ),
    apiUpdatedAt: new Date(dataPoint.updatedAt),
  };

  await prisma.gridElectricityMix.upsert({
    where: {
      dataCenterRegion_dataCenterProvider_datetime: {
        dataCenterRegion: params.dataCenterRegion,
        dataCenterProvider: params.dataCenterProvider,
        datetime: new Date(dataPoint.datetime),
      },
    },
    update: upsertBlock,
    create: upsertBlock,
  });

  return { success: true };
}

/**
 * Syncs all ElectricityMaps data for a given region/provider/date
 */
export async function syncElectricityMapsData(
  params: SyncParams
): Promise<{ success: boolean; errors: string[] }> {
  if (
    await hasExistingDataForDate(
      params.dataCenterRegion,
      params.dataCenterProvider,
      params.date
    )
  ) {
    console.log(
      `Data already exists for ${params.dataCenterRegion}/${params.dataCenterProvider} on ${params.date.toISOString()}`
    );
    return { success: true, errors: [] };
  }
  const syncFunctions = [
    { name: "carbonFreeEnergy", fn: syncCarbonFreeEnergy },
    { name: "renewableEnergy", fn: syncRenewableEnergy },
    { name: "carbonIntensity", fn: syncCarbonIntensity },
    { name: "electricityMix", fn: syncElectricityMix },
  ];

  const results = await Promise.allSettled(
    syncFunctions.map(async ({ name, fn }) => {
      const result = await fn(params);
      return result.success
        ? { name, error: null }
        : { name, error: result.error };
    })
  );

  const errors = results.reduce<string[]>((acc, result, index) => {
    if (result.status === "rejected") {
      return [...acc, `${syncFunctions[index].name}: ${result.reason}`];
    }
    if (result.value.error) {
      return [...acc, `${result.value.name}: ${result.value.error}`];
    }
    return acc;
  }, []);

  return { success: errors.length === 0, errors };
}

/**
 * Syncs data for multiple regions and a specific date
 */
export async function syncAllRegionsForDate(
  date: Date,
  regions: Array<{ region: string; provider: PrismaProvider }>
): Promise<{ totalSuccess: number; totalErrors: number; errors: string[] }> {
  const results = await Promise.all(
    regions.map(async ({ region, provider }) => {
      const result = await syncElectricityMapsData({
        dataCenterRegion: region,
        dataCenterProvider: provider,
        date,
      });
      return { region, provider, ...result };
    })
  );

  return results.reduce(
    (acc, { region, provider, success, errors }) => ({
      totalSuccess: acc.totalSuccess + (success ? 1 : 0),
      totalErrors: acc.totalErrors + (success ? 0 : 1),
      errors: success
        ? acc.errors
        : [...acc.errors, ...errors.map((e) => `${region}/${provider}: ${e}`)],
    }),
    { totalSuccess: 0, totalErrors: 0, errors: [] as string[] }
  );
}
