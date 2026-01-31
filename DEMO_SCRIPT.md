# GreenRatchet Demo Video Script (3 Minutes)

## Opening (0:00 - 0:20)

**[Screen: Landing page with GreenRatchet logo]**

**Narrator:**
"Cloud infrastructure is growing exponentially, but most companies have no idea about its environmental impact. Meet GreenRatchet - the platform that makes cloud sustainability visible, measurable, and actionable."

**[Transition to problem statement with visual stats]**

"Traditional sustainability reporting is manual, slow, and arrives too late to make a difference. By the time you see last year's report, you've already made architectural decisions that locked in inefficient workloads."

---

## The Solution (0:20 - 0:45)

**[Screen: Dashboard overview]**

**Narrator:**
"GreenRatchet changes that. We connect directly to your cloud providers - AWS, GCP, and Azure - to automatically track environmental metrics in real-time."

**[Show dashboard with KPI cards]**

"Here's our dashboard. At a glance, you see your organization's sustainability KPIs: CO2 emissions, energy consumption, water usage, and more. No spreadsheets, no manual calculations - just real data, updated continuously."

**[Highlight the summary cards]**

"We're tracking 10 predefined Key performance indicators (KPIs), which we found from the internet, giving you complete visibility into your infrastructure's environmental footprint."

---

## Cloud Connection (0:45 - 1:15)

**[Screen: Navigate to Cloud Connections page]**

**Narrator:**
"Let's see how easy it is to connect your cloud provider. Click on Cloud Connections."

**[Show AWS connection card]**

"For AWS, we use a secure CloudFormation stack. Click 'Connect AWS'."

**[Show AWS connection dialog - Step 1]**

"First, we generate a cryptographically secure External ID - this prevents confused deputy attacks and keeps your infrastructure safe."

**[Show CloudFormation launch button]**

"Click to launch the CloudFormation stack. It pre-fills all parameters and creates an IAM role with read-only access to CloudWatch and Cost Explorer."

**[Show Role ARN input]**

"Once the stack is created, copy the Role ARN from the outputs and paste it here. That's it - you're connected."

**[Show connected state with last sync time]**

"Now GreenRatchet automatically pulls your cloud usage data and calculates environmental impact using industry-standard methodologies."

---

## Carbon Calculation Methodology (1:15 - 1:45)

**[Screen: Scroll to methodology card on Cloud page]**

**Narrator:**
"How do we calculate this? We use Etsy's Cloud Jewels approach - the gold standard for cloud carbon accounting."

**[Highlight the 5-step process]**

"Step 1: We collect and classify all cloud usage - compute, storage, networking, and memory.

Step 2: We calculate hourly compute load for accurate energy estimation.

Step 3: We apply Power Usage Effectiveness factors for data center overhead.

Step 4: We use regional grid carbon intensity - because emissions vary dramatically by location.

Step 5: We include embodied emissions from hardware manufacturing."

**[Show formula on screen]**

"The result? Total CO2e equals operational emissions plus embodied emissions - giving you the complete picture."

---

## KPIs (1:45 - 2:15)

**[Screen: Navigate to KPIs page]**

**Narrator:**
"Now let's look at the analytics. Here we see all 10 sustainability KPIs."

**[Click on CO2 Emissions KPI to expand]**

"Click any KPI to dive deeper. This shows our total CO2 emissions over time."

**[Show time series chart]**

"The trend line shows we're improving - emissions are decreasing month over month."

**[Show regional breakdown]**

"We can break this down by region. US-East-1 is our highest emitter, but we can see exactly where to optimize."

**[Show service breakdown]**

"And by service - EC2 compute is our biggest contributor. This actionable data helps us make informed decisions about where to reduce our footprint."

**[Quickly show other KPIs - Energy Consumption, Renewable Energy %]**

"We track energy consumption, renewable energy percentage, carbon-free energy, and more - all calculated automatically from your cloud usage."

---

## Audit Trail (2:15 - 2:35)

**[Screen: Navigate to Audit page]**

**Narrator:**
"Transparency is critical for sustainability reporting. That's why every action in GreenRatchet is logged."

**[Show audit log table]**

"Here's our complete audit trail. Every cloud connection, every KPI calculation, every data sync - all timestamped and traceable."

**[Highlight a specific log entry]**

"See this? When we connected AWS, the system logged who did it, when, and what permissions were granted. This level of auditability is essential for ESG compliance and stakeholder reporting."

**[Show calculation details]**

"Even KPI calculations show the formula, inputs, and step-by-step execution. Complete transparency, complete reproducibility."

---

## Cloud Usage Deep Dive (2:35 - 2:50)

**[Screen: Navigate to Cloud Usage page]**

**Narrator:**
"Want to go even deeper? The Cloud Usage page shows granular data."

**[Show time series with operational vs embodied emissions]**

"We separate operational emissions from embodied emissions, so you understand both runtime impact and hardware manufacturing footprint."

**[Show filters - time range, services, regions]**

"Filter by time range, specific services, or regions to analyze exactly what you need."

**[Show instance type breakdown]**

"And see which instance types have the highest embodied emissions - helping you make smarter hardware choices."

---

## Closing (2:50 - 3:00)

**[Screen: Return to dashboard, zoom out to show full platform]**

**Narrator:**
"GreenRatchet: automated cloud sustainability monitoring that's real-time, transparent, and actionable."

**[Show key benefits as text overlay]**

"No more manual reporting. No more waiting for year-end data. Just continuous visibility into your cloud's environmental impact."

**[End screen with logo and tagline]**

"GreenRatchet - Make your cloud sustainable."

---

