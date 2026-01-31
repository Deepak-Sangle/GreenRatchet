# Optimize Database Queries

Patterns for optimizing Prisma queries.

## Use Aggregations

Instead of fetching all records and calculating in JS:

```ts
// ❌ Bad
const records = await prisma.cloudFootprint.findMany({ where });
const total = records.reduce((sum, r) => sum + r.co2e, 0);

// ✅ Good
const result = await prisma.cloudFootprint.aggregate({
  where,
  _sum: { co2e: true },
});
const total = result._sum.co2e ?? 0;
```

## Use groupBy for Breakdowns

```ts
const byRegion = await prisma.cloudFootprint.groupBy({
  by: ["region"],
  where,
  _sum: { co2e: true, kilowattHours: true },
});
```

## Parallel Queries

```ts
const [data1, data2] = await Promise.all([
  prisma.table1.aggregate({ ... }),
  prisma.table2.groupBy({ ... }),
]);
```

## Batch Fetch (N+1 Prevention) (similar to caching or prefetching)

```ts
// Get unique keys
const pairs = mainData.map((r) => ({ region: r.region, provider: r.provider }));

// Fetch all related data in parallel
const relatedResults = await Promise.all(
  pairs.map(({ region, provider }) =>
    prisma.gridData.findFirst({ where: { region, provider } }),
  ),
);

// Build lookup map
const lookupMap = new Map(
  pairs.map((pair, i) => [
    `${pair.region}|${pair.provider}`,
    relatedResults[i],
  ]),
);

// Use map in iteration
for (const r of mainData) {
  const related = lookupMap.get(`${r.region}|${r.provider}`);
}
```
