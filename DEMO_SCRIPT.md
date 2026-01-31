# GreenRatchet Demo Video Script (3 Minutes)

## Opening (0:00 - 0:15)

Cloud infrastructure is exploding. AI workloads are everywhere. But most companies have no idea about their environmental impact.

Traditional sustainability reporting is a nightmare - manual data collection, complex CO2e calculations, and reports that arrive months too late. By the time you see last year's numbers, you've already locked in inefficient workloads.

GreenRatchet changes everything. Real-time cloud sustainability monitoring that's automated, transparent, and actionable.

---

## Dashboard Overview (0:15 - 0:25)

We connect directly to AWS, GCP, and Azure to automatically track environmental metrics. No spreadsheets, no manual work.

Here's the dashboard: 10 sustainability KPIs tracked, 2 active cloud connections. Everything you need at a glance.

---

## Cloud Connection & Backfill (0:25 - 0:50)

Let's connect AWS. Generate a secure External ID to prevent attacks. Launch the CloudFormation stack - it creates a read-only IAM role. Copy the Role ARN, paste it, and you're connected.

Now the power move: click Backfill Data. This syncs the last full year of historical usage in the background. Instant historical context.

We use Etsy's Cloud Jewels methodology - the industry standard. Operational emissions from energy use, plus embodied emissions from hardware manufacturing, using real-time regional grid carbon intensity.

---

## KPI Dashboard (0:50 - 1:20)

The KPI Dashboard shows all 10 metrics: CO2 emissions, energy consumption, water withdrawal, AI compute hours, renewable energy percentage, carbon-free energy, low-carbon regions, electricity mix, GHG intensity, and water-stressed regions.

Click any card to expand. CO2 Emissions shows time-series trends, regional breakdown - US-East-1 is 45% of emissions, US-West-2 is 20%. Service breakdown - EC2 is 60%, Lambda 15%, S3 10%.

The system gives specific recommendations: "Migrate workloads from US-East-1 to US-West-2 for 30% emission reduction." Data-driven insights from your actual usage.

Every KPI has this depth - charts, breakdowns, recommendations. All automated.

---

## Analytics Page (1:20 - 1:50)

The Analytics page is different - this is KPI tracking and management.

Table view shows all KPIs: status badges, actual versus target values, trend indicators. Green means meeting targets, red needs attention.

Click Calculate KPIs to refresh all metrics on demand. The system pulls latest data, runs calculations, updates everything in seconds.

Click any row to expand - see historical performance over 10 periods, trend charts, status tracking. You can see exactly when you met targets and when you didn't.

Create custom KPIs for your specific goals - emissions per customer, per transaction, whatever matters to your organization.

---

## Cloud Usage Deep Dive (1:50 - 2:20)

Cloud Usage page has four views. Timeline separates operational emissions (blue) from embodied emissions (orange) - most tools only show operational, we show the complete picture.

Services view: EC2 at 2.5 metric tons, Lambda at 0.8 metric tons. See exactly where emissions come from.

Regions view: US-East-1 has high carbon intensity from fossil fuels. US-West-2 is cleaner with hydroelectric power. Shifting workloads could cut emissions 40%.

Instance Types view: M5 instances have higher embodied emissions than T3. Switch instance families to reduce footprint.

Filter by time range, services, or regions. Export to CSV for compliance reporting - every data point in a clean format.

---

## Audit Trail (2:20 - 2:45)

Every action is logged. Cloud connections, KPI calculations, data syncs, configuration changes - all timestamped with user details.

Click any entry for full details. KPI calculations show the formula, data sources, input values, and step-by-step execution. If someone questions your numbers, you can prove exactly how they were calculated.

This is enterprise-grade auditability. Your reports aren't just numbers - they're fully reproducible and verifiable. Stakeholders can verify everything. Auditors can trace every calculation.

---

## Closing (2:45 - 3:00)

GreenRatchet: Automated data collection. Industry-standard calculations. Complete transparency. Actionable insights.

Backfill historical data. Export to CSV. Calculate KPIs on demand. Track progress against targets.

10 comprehensive KPIs. Multi-cloud support. Full audit trail. Zero manual work.

No more spreadsheets. No more waiting for year-end reports. Just real-time visibility into your cloud's environmental impact.

GreenRatchet - Make your cloud sustainable.

---
