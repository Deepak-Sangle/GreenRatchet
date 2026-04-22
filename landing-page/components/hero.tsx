import { ArrowRight, BarChart3, Play, Shield, Zap } from "lucide-react";
import Link from "next/link";

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 grid-bg" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-emerald-500/10 rounded-full blur-[120px] animate-pulse-glow" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-600/5 rounded-full blur-[100px]" />
      <div className="absolute top-1/3 right-0 w-[300px] h-[300px] bg-teal-500/5 rounded-full blur-[80px]" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-32 pb-20">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 mb-8 animate-fade-in-up">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-sm text-emerald-400">
              Cloud sustainability made measurable
            </span>
          </div>

          {/* Headline */}
          <h1 className="font-heading text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6 animate-fade-in-up animation-delay-200">
            Track your cloud&apos;s{" "}
            <span className="gradient-text">environmental impact</span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg sm:text-xl text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in-up animation-delay-400">
            GreenRatchet automates sustainability monitoring by integrating with
            your cloud providers. Get real-time carbon footprint tracking,
            energy metrics, and actionable insights.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up animation-delay-600">
            <Link
              href="https://app.greenratchet.site/dashboard"
              className="group flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-black font-medium px-6 py-3 rounded-lg transition-all duration-200 hover:shadow-lg hover:shadow-emerald-500/25"
            >
              Start Monitoring
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="#how-it-works"
              className="flex items-center gap-2 text-zinc-400 hover:text-white font-medium px-6 py-3 rounded-lg border border-zinc-800 hover:border-zinc-700 transition-all duration-200"
            >
              See How It Works
            </Link>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-8 mt-20 pt-10 border-t border-white/5">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Zap className="w-5 h-5 text-emerald-500" />
                <span className="text-2xl sm:text-3xl font-heading font-bold">
                  10+
                </span>
              </div>
              <span className="text-sm text-zinc-500">KPI Metrics</span>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Shield className="w-5 h-5 text-emerald-500" />
                <span className="text-2xl sm:text-3xl font-heading font-bold">
                  100%
                </span>
              </div>
              <span className="text-sm text-zinc-500">Audit Trail</span>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <BarChart3 className="w-5 h-5 text-emerald-500" />
                <span className="text-2xl sm:text-3xl font-heading font-bold">
                  Real-time
                </span>
              </div>
              <span className="text-sm text-zinc-500">Analytics</span>
            </div>
          </div>
        </div>

        {/* Video Preview */}
        <div className="mt-20 relative">
          <div className="absolute -inset-4 bg-emerald-500/20 rounded-2xl blur-2xl opacity-50" />
          <div className="relative gradient-border rounded-2xl overflow-hidden glow">
            <div className="bg-zinc-900/80 p-2">
              {/* Browser Chrome */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80" />
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="bg-zinc-800 rounded-md px-4 py-1.5 text-xs text-zinc-400 flex items-center gap-2">
                    Watch Demo
                  </div>
                </div>
              </div>
              {/* YouTube Embed */}
              <div className="aspect-video bg-zinc-950">
                <iframe
                  src="https://www.youtube.com/embed/Vsr0hgcfZ5g?rel=0&modestbranding=1"
                  title="GreenRatchet Demo"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
