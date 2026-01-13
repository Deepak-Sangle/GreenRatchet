import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        heading: ["var(--font-heading)", "system-ui", "sans-serif"],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Extended semantic colors
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
        },
        info: {
          DEFAULT: "hsl(var(--info))",
          foreground: "hsl(var(--info-foreground))",
        },
        // Chart colors that adapt to theme
        chart: {
          1: "hsl(var(--chart-1))",
          2: "hsl(var(--chart-2))",
          3: "hsl(var(--chart-3))",
          4: "hsl(var(--chart-4))",
          5: "hsl(var(--chart-5))",
        },
        // Enhanced border colors
        "border-light": "hsl(var(--border-light))",
        "border-medium": "hsl(var(--border-medium))",
        "border-strong": "hsl(var(--border-strong))",
        // Tooltip and overlay colors
        tooltip: {
          DEFAULT: "hsl(var(--tooltip-bg))",
          foreground: "hsl(var(--tooltip-foreground))",
        },
        overlay: "hsl(var(--overlay-bg))",
        // Selection colors
        selection: {
          DEFAULT: "hsl(var(--selection-bg))",
          foreground: "hsl(var(--selection-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        soft: "0 2px 8px -2px rgba(0, 0, 0, 0.05), 0 4px 16px -4px rgba(0, 0, 0, 0.08)",
        "soft-lg":
          "0 4px 12px -2px rgba(0, 0, 0, 0.06), 0 8px 24px -4px rgba(0, 0, 0, 0.1)",
        glow: "0 0 20px -5px hsl(var(--primary) / 0.3)",
        // Enhanced elevation shadows using CSS variables
        "elevation-low": "var(--shadow-elevation-low)",
        "elevation-medium": "var(--shadow-elevation-medium)",
        "elevation-high": "var(--shadow-elevation-high)",
        "elevation-highest": "var(--shadow-elevation-highest)",
      },
      backgroundImage: {
        "gradient-subtle":
          "linear-gradient(135deg, hsl(var(--background)) 0%, hsl(var(--muted)) 100%)",
        "gradient-primary":
          "linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(160 60% 35%) 100%)",
        mesh: "radial-gradient(at 40% 20%, hsl(var(--accent) / 0.3) 0px, transparent 50%), radial-gradient(at 80% 0%, hsl(var(--primary) / 0.15) 0px, transparent 50%), radial-gradient(at 0% 50%, hsl(var(--accent) / 0.2) 0px, transparent 50%)",
      },
      // Enhanced animation and transition support
      transitionProperty: {
        theme:
          "background-color, border-color, color, fill, stroke, opacity, box-shadow, transform, filter, backdrop-filter",
      },
      transitionDuration: {
        theme: "200ms",
      },
      transitionTimingFunction: {
        theme: "cubic-bezier(0.4, 0, 0.2, 1)",
      },
      // Opacity utilities for overlays
      opacity: {
        hover: "var(--hover-opacity)",
        active: "var(--active-opacity)",
        overlay: "var(--overlay-opacity)",
      },
    },
  },
  plugins: [tailwindcssAnimate],
};

export default config;
