"use client";

import {
  Activity,
  Cpu,
  Droplets,
  Flame,
  Leaf,
  LucideIcon,
  MapPin,
  PieChart,
  Sun,
  TrendingDown,
  Zap,
} from "lucide-react";
import { MotionValue, motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";

interface Metric {
  icon: LucideIcon;
  name: string;
  description: string;
  detail: string;
  unit: string;
  color: string;
}

const metrics: Metric[] = [
  {
    icon: Flame,
    name: "CO₂ Emissions",
    description: "Total carbon dioxide equivalent emissions",
    detail:
      "Track your total greenhouse gas emissions across all cloud regions. Includes both operational emissions from energy consumption and embodied emissions from hardware manufacturing.",
    unit: "tonnes CO₂e",
    color: "#1a1a1a",
  },
  {
    icon: TrendingDown,
    name: "GHG Intensity",
    description: "Emissions per employee or revenue",
    detail:
      "Normalize your emissions data by business metrics like headcount or revenue. Essential for benchmarking and year-over-year comparisons in ESG reporting.",
    unit: "kg CO₂e/unit",
    color: "#141414",
  },
  {
    icon: Zap,
    name: "Energy Consumption",
    description: "Total electricity usage across regions",
    detail:
      "Monitor kilowatt-hours consumed by your cloud infrastructure. Break down by service type, region, and time period to identify optimization opportunities.",
    unit: "kWh",
    color: "#1a1a1a",
  },
  {
    icon: Droplets,
    name: "Water Withdrawal",
    description: "Data center water consumption",
    detail:
      "Track water usage for cooling in data centers. Particularly important for workloads in water-stressed regions where conservation is critical.",
    unit: "liters",
    color: "#141414",
  },
  {
    icon: Cpu,
    name: "AI Compute Hours",
    description: "GPU and ML workload tracking",
    detail:
      "Dedicated tracking for AI and machine learning workloads. GPU-intensive tasks have significantly higher environmental impact than standard compute.",
    unit: "hours",
    color: "#1a1a1a",
  },
  {
    icon: Leaf,
    name: "Renewable Energy %",
    description: "Percentage from renewable sources",
    detail:
      "Measure how much of your cloud energy comes from renewable sources like wind, solar, and hydro. Track progress toward 100% renewable goals.",
    unit: "%",
    color: "#141414",
  },
  {
    icon: Sun,
    name: "Carbon-Free Energy",
    description: "24/7 carbon-free energy percentage",
    detail:
      "Goes beyond annual averages to measure hour-by-hour carbon-free energy matching. The gold standard for true sustainability measurement.",
    unit: "%",
    color: "#1a1a1a",
  },
  {
    icon: PieChart,
    name: "Electricity Mix",
    description: "Breakdown by energy source type",
    detail:
      "Detailed breakdown of your energy sources: coal, gas, nuclear, wind, solar, hydro, and more. Understand exactly where your power comes from.",
    unit: "breakdown",
    color: "#141414",
  },
  {
    icon: MapPin,
    name: "Low-Carbon Regions",
    description: "Workloads in clean energy regions",
    detail:
      "Percentage of your compute running in regions with cleaner grids. Identify opportunities to migrate workloads for lower environmental impact.",
    unit: "%",
    color: "#1a1a1a",
  },
  {
    icon: Activity,
    name: "Water-Stressed Regions",
    description: "Usage in water-scarce areas",
    detail:
      "Analysis of workloads running in water-stressed regions. Critical for organizations with water stewardship commitments and risk management.",
    unit: "analysis",
    color: "#141414",
  },
];

interface CardProps {
  i: number;
  metric: Metric;
  progress: MotionValue<number>;
  range: [number, number];
  targetScale: number;
}

const Card: React.FC<CardProps> = ({
  i,
  metric,
  progress,
  range,
  targetScale,
}) => {
  const container = useRef(null);
  const { scrollYProgress } = useScroll({
    target: container,
    offset: ["start end", "start start"],
  });

  const scale = useTransform(progress, range, [1, targetScale]);

  return (
    <div
      ref={container}
      className="h-screen flex items-center justify-center sticky top-0"
    >
      <motion.div
        style={{
          backgroundColor: metric.color,
          scale,
          top: `calc(-5vh + ${i * 12}px)`,
        }}
        className="flex flex-col relative h-[320px] w-[85%] max-w-3xl rounded-2xl p-6 origin-top border border-white/10"
      >
        <div className="flex flex-col sm:flex-row sm:items-start gap-6 h-full">
          {/* Icon */}
          <div className="w-16 h-16 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
            <metric.icon className="w-8 h-8 text-emerald-500" />
          </div>

          {/* Content */}
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3 mb-3">
              <h3 className="font-heading text-2xl font-semibold text-white">
                {metric.name}
              </h3>
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {metric.unit}
              </span>
            </div>
            <p className="text-zinc-500 text-sm mb-4">{metric.description}</p>
            <p className="text-zinc-400 leading-relaxed">{metric.detail}</p>
          </div>

          {/* Index */}
          <div className="hidden lg:flex items-center justify-center w-20 h-20 rounded-full bg-zinc-900/50 border border-white/5">
            <span className="text-3xl font-heading font-bold text-zinc-600">
              {String(i + 1).padStart(2, "0")}
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export function Metrics() {
  const container = useRef(null);
  const { scrollYProgress } = useScroll({
    target: container,
    offset: ["start start", "end end"],
  });

  return (
    <section id="metrics" className="relative" ref={container}>
      {/* Background */}
      <div className="absolute inset-0 grid-bg opacity-30" />

      {/* Section Header */}
      <div className="relative z-10 text-center max-w-2xl mx-auto px-6 pt-32 pb-16">
        <span className="text-emerald-500 text-sm font-medium tracking-wider uppercase">
          KPI Metrics
        </span>
        <h2 className="font-heading text-4xl sm:text-5xl font-bold mt-4 mb-6">
          <span className="gradient-text">10+ environmental metrics</span>{" "}
          tracked automatically
        </h2>
        <p className="text-zinc-400 text-lg">
          Comprehensive sustainability KPIs covering carbon, energy, water, and
          regional analysis—all calculated using industry-standard
          methodologies.
        </p>
      </div>

      {/* Stacked Cards */}
      <div className="relative">
        {metrics.map((metric, i) => {
          const targetScale = 1 - (metrics.length - i) * 0.05;
          return (
            <Card
              key={`metric_${i}`}
              i={i}
              metric={metric}
              progress={scrollYProgress}
              range={[i * 0.1, 1]}
              targetScale={targetScale}
            />
          );
        })}
      </div>

    </section>
  );
}
