"use client";

import { signOutAction } from "@/app/actions/auth";
import { AvatarUploadDialog } from "@/components/dashboard/avatar-upload-dialog";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

interface HeaderProps {
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

export function Header({ user, organization }: HeaderProps) {
  const [avatarDialogOpen, setAvatarDialogOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-border/40 bg-[hsl(var(--header-bg))]/95 backdrop-blur-md supports-[backdrop-filter]:bg-[hsl(var(--header-bg))]/80">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <Image
                src="/logo.png"
                alt="GreenRatchet"
                width={44}
                height={44}
                className="h-11 w-11 rounded-xl object-cover"
                priority
              />
              <div className="flex flex-col">
                <h1 className="text-lg font-heading font-bold tracking-tight text-primary">
                  GreenRatchet
                </h1>
                <p className="text-[11px] font-medium text-muted-foreground/80 tracking-wide uppercase">
                  {organization.name}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Theme Toggle */}
            <ThemeToggle variant="icon" size="md" />

            {/* User Avatar - Clickable */}
            <button
              onClick={() => setAvatarDialogOpen(true)}
              className="relative group cursor-pointer transition-transform hover:scale-105"
              aria-label="Update profile picture"
            >
              {user.avatarUrl ? (
                <Image
                  src={user.avatarUrl}
                  alt={user.name || "User avatar"}
                  width={40}
                  height={40}
                  className="h-10 w-10 rounded-full object-cover ring-2 ring-border/50 ring-offset-2 ring-offset-background transition-all group-hover:ring-primary/50"
                />
              ) : (
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/20 to-accent flex items-center justify-center ring-2 ring-border/50 ring-offset-2 ring-offset-background transition-all group-hover:ring-primary/50">
                  <span className="text-sm font-semibold text-primary">
                    {user.name?.charAt(0)?.toUpperCase() || "U"}
                  </span>
                </div>
              )}
              <div className="absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                <span className="text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity font-medium">
                  Edit
                </span>
              </div>
            </button>

            <AvatarUploadDialog
              currentAvatarUrl={user.avatarUrl}
              userName={user.name}
              open={avatarDialogOpen}
              onOpenChange={setAvatarDialogOpen}
            />

            {/* User Info */}
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-foreground leading-tight">
                {user.name}
              </p>
            </div>

            {/* Divider */}
            <div className="h-8 w-px bg-border/60 hidden sm:block" />

            {/* Sign Out */}
            <form action={signOutAction}>
              <Button
                variant="ghost"
                size="sm"
                type="submit"
                className="text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span className="ml-2 hidden sm:inline text-xs font-medium">
                  Sign out
                </span>
              </Button>
            </form>
          </div>
        </div>
      </header>
    </>
  );
}
