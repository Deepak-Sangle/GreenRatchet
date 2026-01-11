/**
 * ElectricityMaps API Client
 * Provides type-safe access to carbon intensity and energy mix data
 */

import { ElectricityMapsProvider } from "@/app/generated/prisma/enums";

interface EnergyMix {
  nuclear: number;
  geothermal: number;
  biomass: number;
  coal: number;
  wind: number;
  solar: number;
  hydro: number;
  gas: number;
  oil: number;
  unknown: number;
  "hydro discharge": number;
  "battery discharge": number;
}

interface BaseApiResponse {
  zone: string;
  updatedAt: string;
  isEstimated: boolean | null;
  estimationMethod: string | null;
  temporalGranularity: string;
  _disclaimer?: string;
}

export interface CarbonFreeEnergyApiResponse extends BaseApiResponse {
  datetime: string;
  createdAt: string;
  unit: "%";
  value: number;
}

export interface RenewableEnergyApiResponse extends BaseApiResponse {
  datetime: string;
  createdAt: string;
  unit: "%";
  value: number;
}

export interface CarbonIntensityApiResponse extends BaseApiResponse {
  unit: "gCO2eq/kWh";
  data: Array<{
    datetime: string;
    updatedAt: string;
    createdAt: string;
    emissionFactorType: string;
    isEstimated: boolean | null;
    estimationMethod: string | null;
    value: number;
  }>;
}

export interface ElectricityMixApiResponse extends BaseApiResponse {
  unit: "MW";
  data: Array<{
    datetime: string;
    updatedAt: string;
    isEstimated: boolean | null;
    estimationMethod: string | null;
    mix: EnergyMix;
  }>;
}

export interface ElectricityMapsRequestParams {
  dataCenterRegion: string;
  dataCenterProvider: ElectricityMapsProvider;
  datetime: string;
}

const BASE_URL = "https://api.electricitymaps.com/v3";

function buildQueryString(params: ElectricityMapsRequestParams): string {
  return new URLSearchParams({
    dataCenterRegion: params.dataCenterRegion,
    dataCenterProvider: params.dataCenterProvider,
    datetime: params.datetime,
  }).toString();
}

async function fetchElectricityMapsData<T>(
  endpoint: string,
  params: ElectricityMapsRequestParams
): Promise<T> {
  const authToken = process.env.ELECTRICITY_MAPS_API_KEY;

  if (!authToken) {
    throw new Error("ELECTRICITY_MAPS_API_KEY environment variable is not set");
  }

  const url = `${BASE_URL}${endpoint}?${buildQueryString(params)}`;

  const response = await fetch(url, {
    headers: { "auth-token": authToken },
    next: { revalidate: 3600 },
  });

  if (!response.ok) {
    throw new Error(
      `ElectricityMaps API error: ${response.status} ${response.statusText}`
    );
  }

  return response.json();
}

export async function getCarbonFreeEnergy(
  params: ElectricityMapsRequestParams
): Promise<CarbonFreeEnergyApiResponse> {
  return fetchElectricityMapsData<CarbonFreeEnergyApiResponse>(
    "/carbon-free-energy/past",
    params
  );
}

export async function getRenewableEnergy(
  params: ElectricityMapsRequestParams
): Promise<RenewableEnergyApiResponse> {
  return fetchElectricityMapsData<RenewableEnergyApiResponse>(
    "/renewable-energy/past",
    params
  );
}

export async function getCarbonIntensityFossilOnly(
  params: ElectricityMapsRequestParams
): Promise<CarbonIntensityApiResponse> {
  return fetchElectricityMapsData<CarbonIntensityApiResponse>(
    "/carbon-intensity-fossil-only/past",
    params
  );
}

export async function getElectricityMix(
  params: ElectricityMapsRequestParams
): Promise<ElectricityMixApiResponse> {
  return fetchElectricityMapsData<ElectricityMixApiResponse>(
    "/electricity-mix/past",
    params
  );
}

export function formatDateTimeForAPI(date: Date): string {
  const pad = (n: number): string => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
