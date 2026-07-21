"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  FileText,
  LayoutDashboard,
  Lock,
  LogOut,
  Menu,
  Swords,
  Trophy,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth/auth-context";
import { adminNav, participantNav } from "@/config/site";
import { cn } from "@/lib/utils";

const iconMap = {
  LayoutDashboard,
  BookOpen,
  Swords,
  Trophy,
  FileText,
  Users,
};

interface SidebarProps {
  variant?: "participant" | "admin";
}

export function Sidebar({ variant = "participant" }: SidebarProps) {
  const pathname = usePathname();
  const { logout, timer } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const links = variant === "admin" ? adminNav : participantNav;
  const challengeLocked = !timer?.challengeUnlocked;

  const navContent = (
    <div className="flex h-full flex-col">
      <div className="px-5 py-6">
        <Link
          href={variant === "admin" ? "/admin" : "/dashboard"}
          className="text-lg font-black text-[#10152f]"
          onClick={() => setMobileOpen(false)}
        >
          PROMPT WAR
        </Link>
      </div>

      <nav className="flex-1 space-y-2 px-3 py-3">
        {links.map((link) => {
          const Icon = iconMap[link.icon as keyof typeof iconMap];
          const isActive = pathname === link.href;
          const isLocked =
            "lockable" in link && link.lockable && challengeLocked;

          return (
            <Link
              key={link.href}
              href={isLocked ? "#" : link.href}
              onClick={(event) => {
                if (isLocked) {
                  event.preventDefault();
                  return;
                }
                setMobileOpen(false);
              }}
              className={cn(
                "flex items-center gap-3 rounded-md px-4 py-3 text-xs font-bold transition",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-[#10152f] hover:bg-primary/5 hover:text-primary",
                isLocked && "cursor-not-allowed opacity-50"
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{link.label}</span>
              {isLocked ? <Lock className="ml-auto h-4 w-4" /> : null}
            </Link>
          );
        })}
      </nav>

      <div className="p-4">
        <Button
          variant="ghost"
          className="w-full justify-start text-[#10152f] hover:text-destructive"
          onClick={() => void logout()}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );

  return (
    <>
      <button
        type="button"
        className="fixed left-4 top-4 z-50 rounded-lg border border-primary/20 bg-background p-2 text-primary lg:hidden"
        onClick={() => setMobileOpen(true)}
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      <aside className="hidden w-56 shrink-0 border-r border-border bg-white lg:block">
        {navContent}
      </aside>

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/70"
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu overlay"
          />
          <aside className="relative h-full w-72 border-r border-primary/20 bg-card shadow-xl">
            <button
              type="button"
              className="absolute right-4 top-4 rounded-lg p-2 text-muted-foreground"
              onClick={() => setMobileOpen(false)}
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
            {navContent}
          </aside>
        </div>
      ) : null}
    </>
  );
}
