# Timeline, decisions, challenges:

### This Timeline contains both the challenges faced, how I overcame them, how Kiro helped in the process and also what features I did during each period

## Jan 10 – Jan 11

Started with ideation, planning, and scoping features that would actually be useful for companies. With the rise of AI, cloud usage is increasing rapidly, yet most applications are built without considering environmental impact. Many don’t even see it as a real problem. The idea was to create something that makes this impact visible and actionable. While researching, I realized that many big tech companies have sustainability requirements, but calculating them requires deep expertise. Cloud providers like AWS, GCP, and Azure only expose overall CO₂e emissions, not the KPIs companies actually need for sustainability reporting. This gap led to the birth of GreenRatchet.

## Jan 12

Continued refining the idea, user flow, and UI/UX. Defined 10 predefined sustainability KPIs, which alone took ~4 hours due to constant back-and-forth research using the internet, Kiro, and ChatGPT to ensure feasibility and relevance.

## Jan 13

Started implementation after creating detailed Kiro steering docs. Used my usual stack: Next.js + Prisma ORM (Supabase), server actions for a simple backend, and shadcn/ui for design (which I loved). Set up the app router, authentication with NextAuth, and dark mode using semantic tokens (important to avoid hardcoding and repetition). I wanted to setup a proper backend in fastify, but for the sake of hackathon I didn't. Reason was that I needed to perform certain long running cron jobs that runs daily in order for the project to work which I cannot in Nextjs.

## Jan 14

Then I fed the entire PRD created to kiro-cli to see how far it could go. Didn’t love the initial Kiro output but still kept it assuming I will clean it up later. Pages like the dashboard, user profile, settings, audit table, and cloud connection table were surprisingly solid. Only minor styling fixes were needed. Since these were the easier parts, I focused on cleaning them up code-wise first.

## Jan 15

I spent the entire day working on cloud connections. Implementing a one-click connection button was unexpectedly hard. Even though kiro did the frontend quite well, and well backend was also almost done, the last bit to make it work was quite challenging. Thus after changing approach, I used AWS CloudFormation stacks to solve it. I also had to make a difficult decision to temporarily skip GCP and Azure integration due to infrastructure complexity. Continued exploring AWS CloudWatch and related services to understand what data could realistically power the KPIs.

## Jan 16

As I said earlier, other pages like /dashboard and /settings were quite good, but it still needed some work. Especially the image upload endpoint. After a couple of hiccups, I directed kiro to simply treat supabase storage as a AWS s3 storage and assume it has s3 keys. And that did the trick.

## Jan 17 – Jan 21

This was the most challenging and core part of GreenRatchet. Focus was on building services to fetch actual cloud usage data. Explored multiple resources and services including cloudcarbonfootprint.org (open source), and paid APIs like oxygenit.io, electricitymaps.com, climatiq.io, and co2api.fi. I spent significant time understanding and modifying Cloud Carbon Footprint repository to fit my use case, but eventually I couldn't make it work. Tried building everything in-house, hit another wall, and finally settled on using external services. Most didn’t have free tiers, but OxygenIT did, and Electricity Maps offered a student tier—so I used both. Ultimately, I heavily customized the open-source repo to make it work for my needs. This was the most challenging part of the hackathon, primarily because extracting cloud usage needs to be 100% correct, not to mention I had to cater needs of each of the AWS service.

## Jan 22 - Jan 23

Before implementing KPIs, I needed additional usage data such as AWS’s official Power Usage Effectiveness (PUE) and Water Usage Effectiveness (WUE) for their hardware instances. I spent time sourcing this data and integrating it into the codebase. However, I couldn’t find reliable sources for other metrics like Carbon-Free Energy %, Renewable Energy %, and Electricity Mix % at a regional level. To fill this gap, I integrated Electricity Maps.

This introduced another blocker due to heavy rate limiting. After a brief discussion with Kiro, I implemented a simple solution: pre-fetching the required data, storing it in the database, and querying it locally instead of hitting the Electricity Maps API repeatedly. This resolved the issue cleanly. The only remaining concern was running this logic as a cron job, but for the purposes of the hackathon, I intentionally skipped that added complexity.

## Jan 24 – Jan 27

With raw usage calculations along helper data like electricity mix distribution in place, I starting working on what actually matters to users: KPI monitoring. This turned out easier than expected since all usage data was already stored in the database. Kiro performed extremely well here, thanks to the detailed steering docs. After implementing 3 KPIs, I created a reusable new-kpi.md prompt to generate the remaining 7. I also found out that many times, kiro misjudged the code output units, for eg. gCO2e instead of mTCO2 or mL instead of L. What helped was attaching the postgres MCP server to it, and in the prompt asking it to verify the data present in the db using the mcp server before doing the actual calculation Performance and code duplication issues surfaced, so I created an optimize-db-queries.md prompt that reduced response time from ~2s to ~200ms. Solution was simple, kiro was making too many db calls repeatedly which could be pre fetched (instead of a for loop). I then used git diff tool with Kiro to enforce my coding practices across new files, fixing the rest manually. I also spent some time creating a quick LinkedIn scrapper to get company headcount, for governance KPI (GHG intensity per employee). Used web-share proxies since I had some already.

## Jan 28 – Jan 29

Cleaned up remaining AI-generated code (“AI slop”) using (ironically) more AI :) The key was combining human guidance with AI execution. This reduced total lines of code by ~30% by removing duplication and unnecessary abstractions. This was also possible because of the fact that my application had lots of repeated code blocks, for eg. kiro initially created same piece of code for all 10 KPIs, with very minute differences. I had kiro create generic functionality to make them more maintainable and it did quite a good job. 

## Jan 30

Created markdown documentation, demo videos, and completed the final submission. Used Screen Studio to record an aesthetic demo video.