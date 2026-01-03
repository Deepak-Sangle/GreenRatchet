"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  FileText,
  Cloud,
  BarChart3,
  History,
} from "lucide-react";

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
    <nav className="w-64 border-r bg-white p-4">
      <div className="space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
