# Critical Coding Rules (MUST FOLLOW)

## 1. DRY - Don't Repeat Yourself

**Extract helper functions for ANY repeated logic (3+ lines repeated = refactor immediately).**

```tsx
// ❌ BAD - Repeated code
const serviceId1 = `${metric.serviceName}-${metric.region}-${metric.instanceType || "default"}`;
const serviceId2 = `${metric.serviceName}-${metric.region}-${metric.instanceType || "default"}`;

// ✅ GOOD - Helper function
function generateServiceId(metric: ServiceMetrics) {
  return `${metric.serviceName}-${metric.region}-${metric.instanceType || "default"}`;
}
```

## 2. Immutability - Never Mutate

**Use immutable patterns. Never mutate objects/arrays directly.**

```tsx
// ❌ BAD - Mutation
existingMetrics.totalCost += metric.totalCost;
array.push(item);

// ✅ GOOD - Immutable
const updated = {
  ...existingMetrics,
  totalCost: existingMetrics.totalCost + metric.totalCost,
};
const newArray = [...array, item];
```

## 3. Strong Typing - No `any`, No Implicit Types

**Every function parameter, return value, and variable must be explicitly typed.**

```tsx
// ❌ BAD
function process(data: any) { ... }
const result = await fetch(url);

// ✅ GOOD
function process(data: MetricsData): ProcessedResult { ... }
const result: ApiResponse = await fetch(url);
```

## 4. Use ts-pattern for Complex Conditionals

**Replace nested if/else and switch with `match` from ts-pattern.**

```tsx
import { match } from "ts-pattern";

// ❌ BAD
if (metric.serviceName === "EC2") {
  // ...
} else if (metric.serviceName === "RDS") {
  // ...
} else if (metric.serviceName === "S3") {
  // ...
}

// ✅ GOOD
match(metric.serviceName)
  .with("EC2", () => ({ instanceType: metric.instanceType }))
  .with("RDS", () => ({ dbClass: metric.dbInstanceClass }))
  .with("S3", () => ({}))
  .exhaustive();
```

## 5. Helper Functions Everywhere

**Every reusable piece of logic must be a named helper function with JSDoc.**

```tsx
// ✅ GOOD - Small, focused helpers
/**
 * Calculates total network traffic from multiple metric arrays
 */
function calculateNetworkTotal(...metrics: MetricData[][]): number | undefined {
  const total = metrics.reduce(
    (sum, arr) => sum + arr.reduce((a, b) => a + b.value, 0),
    0
  );
  return total > 0 ? total : undefined;
}
```

## Documentation Policy

**NEVER create `.md` documentation files after implementing a feature unless explicitly requested.**
