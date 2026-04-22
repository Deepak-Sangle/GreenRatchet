import { CTA } from "@/components/cta";
import { Features } from "@/components/features";
import { Footer } from "@/components/footer";
import { Hero } from "@/components/hero";
import { HowItWorks } from "@/components/how-it-works";
import { Metrics } from "@/components/metrics";
import { Navigation } from "@/components/navigation";

export default function LandingPage() {
  return (
    <main className="min-h-screen">
      <Navigation />
      <Hero />
      <Features />
      <HowItWorks />
      <Metrics />
      <CTA />
      <Footer />
    </main>
  );
}
