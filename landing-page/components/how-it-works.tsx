import { BarChart3, CloudCog, Database, FileText } from "lucide-react";

const steps = [
  {
    icon: CloudCog,
    step: "01",
    title: "Connect Your Cloud",
    description:
      "One-click integration with AWS, GCP, or Azure using secure IAM roles. No credentials stored—just read-only access to usage data.",
  },
  {
    icon: Database,
    step: "02",
    title: "Automatic Data Collection",
    description:
      "We pull your cloud usage metrics and combine them with real-time regional grid carbon intensity data.",
  },
  {
    icon: BarChart3,
    step: "03",
    title: "Calculate & Analyze",
    description:
      "Using industry-standard methodologies, we calculate your carbon footprint, energy consumption, and environmental KPIs.",
  },
  {
    icon: FileText,
    step: "04",
    title: "Monitor & Report",
    description:
      "Track trends over time, identify optimization opportunities, and generate compliance-ready sustainability reports.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="relative py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-zinc-950/50" />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[120px]" />

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-20">
          <span className="text-emerald-500 text-sm font-medium tracking-wider uppercase">
            How It Works
          </span>
          <h2 className="font-heading text-4xl sm:text-5xl font-bold mt-4 mb-6">
            From zero to <span className="gradient-text">full visibility</span>{" "}
            in minutes
          </h2>
          <p className="text-zinc-400 text-lg">
            No complex setup. No manual data entry. Just connect and start
            monitoring.
          </p>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div
              key={index}
              className="relative p-6 rounded-xl border border-white/5 bg-zinc-900/30 hover:bg-zinc-900/50 hover:border-emerald-500/20 transition-all duration-300"
            >
              {/* Step Number & Icon Row */}
              <div className="flex items-center gap-4 mb-5">
                <span className="text-4xl font-heading font-bold text-emerald-500/20">
                  {step.step}
                </span>
                <div className="w-12 h-12 rounded-full bg-zinc-900 border border-emerald-500/30 flex items-center justify-center">
                  <step.icon className="w-5 h-5 text-emerald-500" />
                </div>
              </div>

              {/* Content */}
              <h3 className="font-heading text-lg font-semibold mb-3">
                {step.title}
              </h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
