"use client";

import { signOutAction } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

interface HeaderProps {
  user: {
    name: string | null;
    email: string | null;
    role: string;
  };
  organizationName: string;
}

export function Header({ user, organizationName }: HeaderProps) {
  return (
    <header className="border-b bg-white">
      <div className="flex h-16 items-center justify-between px-6">
        <div>
          <h1 className="text-xl font-bold text-primary">GreenRatchet</h1>
          <p className="text-xs text-muted-foreground">{organizationName}</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm font-medium">{user.name}</p>
            <p className="text-xs text-muted-foreground">
              {user.role === "BORROWER" ? "Borrower" : "Lender"}
            </p>
          </div>
          <form action={signOutAction}>
            <Button variant="ghost" size="sm" type="submit">
              <LogOut className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </header>
  );
}
