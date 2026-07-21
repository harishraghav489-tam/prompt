"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/lib/auth/auth-context";
import { cn } from "@/lib/utils";

interface NavbarProps {
  title?: string;
}

export function Navbar({ title = "Welcome back, Participant" }: NavbarProps) {
  const { user } = useAuth();
  const pathname = usePathname();
  const displayName = user?.name ?? "Participant";
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <header className="flex items-center justify-between border-b border-border bg-white px-4 py-4 md:px-8">
      <div>
        <p className="text-sm font-medium text-slate-600">Welcome back,</p>
        <p className="text-2xl font-black leading-tight text-primary">
          {pathname.startsWith("/admin")
            ? title.replace("Participant", "Admin")
            : title.replace("Participant", displayName.split(" ")[0] ?? "Participant")}
          <span className="ml-1 text-base">👋</span>
        </p>
      </div>
      <div className="flex items-center gap-4">
        <Avatar className="h-8 w-8 bg-primary/10 text-primary">
          <AvatarFallback className="bg-primary/10 text-primary">{initial}</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}

export function PublicNavbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-8">
        <Link href="/" className="text-xl font-black text-[#10152f]">
          PROMPT WAR
        </Link>
        <nav className="hidden items-center gap-8 md:flex">
          {[
            { label: "Home", href: "/" },
            { label: "About", href: "/#about" },
            { label: "Rules", href: "/#rules" },
            { label: "Contact", href: "/#contact" },
            { label: "How It Works", href: "/implementation" },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-sm font-medium text-muted-foreground transition hover:text-primary",
                pathname === link.href && "text-primary"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <Link href="/login">
          <span className="inline-flex h-10 items-center rounded-lg border border-primary/60 px-5 text-sm font-semibold text-primary transition hover:bg-primary/10">
            SIGN IN
          </span>
        </Link>
      </div>
    </header>
  );
}
