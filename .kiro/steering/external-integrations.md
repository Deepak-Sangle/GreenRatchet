# External Integrations

## Electricity Maps API

- Service: `lib/services/electricity-maps.ts`
- Sync: `lib/services/electricity-maps-sync.ts`
- Data tables: GridCarbonIntensity, GridCarbonFreeEnergy, GridRenewableEnergy, GridElectricityMix

## Cloud Providers

- AWS, GCP, Azure connections stored in CloudConnection table
- Footprint data in CloudFootprint table
- Use `getOrganizationConnectionIds` and `buildCloudFootprintWhereClause` helpers

## Integration Pattern

1. Service file in `lib/services/` handles API calls
2. Server action in `app/actions/` wraps service with auth
3. Sync functions upsert data to avoid duplicates

## Environment Variables

- Store in `.env`, check existence before use
- Sync `.env.example` without actual values
- Never use `!` assertion on env vars
