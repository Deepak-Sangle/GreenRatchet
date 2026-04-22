import { Github, Linkedin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="relative border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <Image
                src="/logo.png"
                alt="GreenRatchet"
                width={32}
                height={32}
                className="rounded-lg"
              />
              <span className="font-heading font-bold text-lg">
                GreenRatchet
              </span>
            </Link>
            <p className="text-zinc-500 text-sm max-w-sm leading-relaxed">
              Automate cloud sustainability monitoring with real-time KPI
              tracking, carbon footprint analysis, and actionable insights.
            </p>
            {/* Social Links */}
            <div className="flex items-center gap-4 mt-6">
              <a
                href="https://github.com/Deepak-sangle/GreenRatchet"
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-500 hover:text-white transition-colors"
                aria-label="GitHub"
              >
                <Github className="w-5 h-5" />
              </a>
              <a
                href="https://www.linkedin.com/in/deepaksangle/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-500 hover:text-white transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="font-medium text-sm mb-4">Product</h4>
            <ul className="space-y-3">
              <li>
                <Link
                  href="#features"
                  className="text-zinc-500 hover:text-white text-sm transition-colors"
                >
                  Features
                </Link>
              </li>
              <li>
                <Link
                  href="#how-it-works"
                  className="text-zinc-500 hover:text-white text-sm transition-colors"
                >
                  How It Works
                </Link>
              </li>
              <li>
                <Link
                  href="#metrics"
                  className="text-zinc-500 hover:text-white text-sm transition-colors"
                >
                  KPI Metrics
                </Link>
              </li>
              <li>
                <Link
                  href="https://app.greenratchet.site/dashboard"
                  className="text-zinc-500 hover:text-white text-sm transition-colors"
                >
                  Console
                </Link>
              </li>
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="font-medium text-sm mb-4">Company</h4>
            <ul className="space-y-3">
              <li>
                <a
                  href="https://github.com/Deepak-sangle/GreenRatchet"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-zinc-500 hover:text-white text-sm transition-colors"
                >
                  GitHub
                </a>
              </li>
              <li>
                <a
                  href="https://www.linkedin.com/in/deepaksangle/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-zinc-500 hover:text-white text-sm transition-colors"
                >
                  LinkedIn
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-zinc-600 text-sm">
            © {new Date().getFullYear()} GreenRatchet. All rights reserved.
          </p>
          <p className="text-zinc-600 text-sm">
            Built with 💚 for a sustainable cloud
          </p>
        </div>
      </div>
    </footer>
  );
}
