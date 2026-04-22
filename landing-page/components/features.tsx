import { Cloud, FileCheck, Globe, LineChart, Lock, Zap } from "lucide-react";

const features = [
  {
    icon: Cloud,
    title: "Multi-Cloud Integration",
    description:
      "Connect AWS, GCP, and Azure with one-click setup. Unified visibility across all your cloud providers.",
  },
  {
    icon: LineChart,
    title: "Real-Time KPI Tracking",
    description:
      "Monitor CO₂ emissions, energy consumption, water usage, and more with live dashboards and trend analysis.",
  },
  {
    icon: FileCheck,
    title: "Audit-Ready Reports",
    description:
      "Every calculation is logged with complete transparency. Export compliance-ready reports for ESG disclosures.",
  },
  {
    icon: Zap,
    title: "Industry-Standard Methodology",
    description:
      "Built on Etsy's Cloud Jewels approach—the gold standard for cloud carbon accounting.",
  },
  {
    icon: Globe,
    title: "Regional Grid Data",
    description:
      "Real-time carbon intensity data by region. Know exactly how clean your compute is wherever it runs.",
  },
  {
    icon: Lock,
    title: "Enterprise Security",
    description:
      "IAM role-based authentication with read-only access. Your credentials never leave your infrastructure.",
  },
];

export function Features() {
  return (
    <section id="features" className="relative py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 grid-bg opacity-50" />
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[100px]" />

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-emerald-500 text-sm font-medium tracking-wider uppercase">
            Features
          </span>
          <h2 className="font-heading text-4xl sm:text-5xl font-bold mt-4 mb-6">
            Everything you need for{" "}
            <span className="gradient-text">sustainable cloud ops</span>
          </h2>
          <p className="text-zinc-400 text-lg">
            From real-time monitoring to compliance reporting, GreenRatchet
            gives you complete visibility into your cloud&apos;s environmental
            footprint.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative p-6 rounded-xl border border-white/5 bg-zinc-900/30 hover:bg-zinc-900/50 hover:border-emerald-500/20 transition-all duration-300"
            >
              {/* Icon */}
              <div className="w-12 h-12 rounded-lg bg-emerald-500/10 flex items-center justify-center mb-4 group-hover:bg-emerald-500/20 transition-colors">
                <feature.icon className="w-6 h-6 text-emerald-500" />
              </div>

              {/* Content */}
              <h3 className="font-heading text-lg font-semibold mb-2">
                {feature.title}
              </h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                {feature.description}
              </p>

              {/* Hover Glow */}
              <div className="absolute inset-0 rounded-xl bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
