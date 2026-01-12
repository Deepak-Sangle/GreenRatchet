"use client";

import { SettingsSidebar } from "@/components/dashboard/settings-sidebar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Activity,
  BarChart3,
  Cloud,
  FileText,
  Gauge,
  History,
  LayoutDashboard,
  Settings,
  Target,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  exact?: boolean;
}

interface NavProps {
  role: string;
  user: {
    id: string;
    name: string | null;
    email: string | null;
    avatarUrl: string | null;
  };
  organization: {
    id: string;
    name: string;
    headquarters: string | null;
    linkedinUrl: string | null;
    employeeCount: number | null;
    annualRevenue: number | null;
  };
}

export function Nav({ role, user, organization }: NavProps) {
  const pathname = usePathname();
  const [settingsOpen, setSettingsOpen] = useState(false);

  const navItems: NavItem[] = [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "SLL Deals",
      href: "/loans",
      icon: FileText,
    },
    ...(role === "BORROWER"
      ? ([
          {
            label: "Cloud Connections",
            href: "/cloud",
            icon: Cloud,
            exact: true,
          },
        ] satisfies NavItem[])
      : []),
    {
      label: "Cloud Usage",
      href: "/cloud/usage",
      icon: Gauge,
    },
    {
      label: "KPIs",
      href: "/kpis",
      icon: Target,
    },
    {
      label: "KPI Analytics",
      href: "/analytics",
      icon: BarChart3,
    },
    {
      label: "Audit Trail",
      href: "/audit",
      icon: History,
    },
  ];

  return (
    <>
      <nav className="w-64 border-r border-border/40 bg-[hsl(var(--sidebar-bg))] p-4 flex flex-col">
        {/* Nav Items */}
        <div className="space-y-1.5 flex-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.exact
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(item.href + "/");

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm shadow-primary/25"
                    : "text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                )}
              >
                <Icon
                  className={cn(
                    "h-[18px] w-[18px] transition-transform duration-200",
                    !isActive && "group-hover:scale-110"
                  )}
                />
                <span className="tracking-tight">{item.label}</span>
                {isActive && (
                  <div className="ml-auto h-1.5 w-1.5 rounded-full bg-primary-foreground/80" />
                )}
              </Link>
            );
          })}
        </div>

        {/* Bottom section */}
        <div className="mt-auto space-y-3">
          {/* Settings Button */}
          <Button
            variant="outline"
            onClick={() => setSettingsOpen(true)}
            className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground hover:bg-muted/80"
          >
            <Settings className="h-[18px] w-[18px]" />
            <span className="tracking-tight">Settings</span>
          </Button>

          {/* Status */}
          <div className="pt-3 border-t border-border/40">
            <div className="px-3 py-2 flex items-center justify-between">
              <p className="text-[10px] font-medium text-muted-foreground/50 uppercase tracking-wide">
                GreenRatchet v1.0
              </p>
              <a
                href="https://stats.uptimerobot.com/CniKWG5yWE"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-1.5 text-muted-foreground/60 hover:text-emerald-500 transition-colors duration-200"
                title="API Status"
              >
                <Activity className="h-3.5 w-3.5 group-hover:animate-pulse" />
                <span className="text-[10px] font-medium uppercase tracking-wide">
                  Status
                </span>
              </a>
            </div>
          </div>
        </div>
      </nav>

      <SettingsSidebar
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        user={user}
        organization={organization}
      />
    </>
  );
}
