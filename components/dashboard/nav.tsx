"use client";

import { cn } from "@/lib/utils";
import {
  BarChart3,
  Cloud,
  FileText,
  History,
  LayoutDashboard,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavProps {
  role: string;
}

export function Nav({ role }: NavProps) {
  const pathname = usePathname();

  const navItems = [
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
      ? [
          {
            label: "Cloud Connections",
            href: "/cloud",
            icon: Cloud,
          },
        ]
      : []),
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
    <nav className="w-64 border-r border-border/40 bg-[hsl(var(--sidebar-bg))] p-4 flex flex-col">
      {/* Nav Items */}
      <div className="space-y-1.5 flex-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");

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
      <div className="mt-auto pt-4 border-t border-border/40">
        <div className="px-3 py-2">
          <p className="text-[10px] font-medium text-muted-foreground/50 uppercase tracking-wide">
            GreenRatchet v1.0
          </p>
        </div>
      </div>
    </nav>
  );
}
