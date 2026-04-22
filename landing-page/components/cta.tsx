import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";

export function CTA() {
  return (
    <section className="relative py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-500/5 to-transparent" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-emerald-500/10 rounded-full blur-[120px]" />

      <div className="relative z-10 max-w-4xl mx-auto px-6">
        <div className="gradient-border rounded-2xl p-12 text-center glow-sm">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 mb-6">
            <Sparkles className="w-4 h-4 text-emerald-500" />
            <span className="text-sm text-emerald-400">
              Start in under 5 minutes
            </span>
          </div>

          {/* Headline */}
          <h2 className="font-heading text-4xl sm:text-5xl font-bold mb-6">
            Ready to make your cloud{" "}
            <span className="gradient-text">sustainable</span>?
          </h2>

          {/* Description */}
          <p className="text-zinc-400 text-lg max-w-2xl mx-auto mb-10">
            Join organizations committed to reducing their cloud
            infrastructure&apos;s environmental footprint. Connect your cloud
            provider and start monitoring today.
          </p>

          {/* CTA Button */}
          <div className="flex items-center justify-center">
            <Link
              href="https://app.greenratchet.site/dashboard"
              className="group flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-black font-medium px-8 py-4 rounded-lg transition-all duration-200 hover:shadow-lg hover:shadow-emerald-500/25"
            >
              Get Started Free
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Trust Indicators */}
          <div className="mt-12 pt-8 border-t border-white/5">
            <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-zinc-500">
              <div className="flex items-center gap-2">
                <svg
                  className="w-4 h-4 text-emerald-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                No credit card required
              </div>
              <div className="flex items-center gap-2">
                <svg
                  className="w-4 h-4 text-emerald-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                Read-only cloud access
              </div>
              <div className="flex items-center gap-2">
                <svg
                  className="w-4 h-4 text-emerald-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                Full audit transparency
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
