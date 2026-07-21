"use client";

import Link from "next/link";
import { Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <main className="min-h-screen px-4 py-8 text-[#10152f]">
      <section className="promptwar-panel mx-auto grid min-h-[78vh] max-w-7xl overflow-hidden md:grid-cols-[1fr_1.12fr]">
        <div className="flex flex-col p-6 md:p-8">
          <header className="flex items-center justify-between">
            <Link href="/" className="text-xl font-black">
              PROMPT WAR
            </Link>
            <nav className="hidden items-center gap-8 text-xs font-bold uppercase md:flex">
              <a href="#home">Home</a>
              <a href="#about">About</a>
              <a href="#rules">Rules</a>
              <a href="#contact">Contact</a>
            </nav>
            <Button asChild size="sm">
              <Link href="/login">Login</Link>
            </Button>
          </header>

          <div id="home" className="flex flex-1 flex-col justify-center py-16">
            <h1 className="max-w-xl text-4xl font-black leading-tight md:text-6xl">
              THE ULTIMATE <span className="text-primary">PROMPT ENGINEERING</span>{" "}
              SHOWDOWN
            </h1>
            <p className="mt-8 max-w-sm text-base font-medium leading-7 text-slate-700">
              Craft the perfect prompt. Beat the competition. Rise to the top of
              the leaderboard!
            </p>
            <div className="mt-10 flex gap-4">
              <Button asChild>
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild variant="outline">
                <a href="#rules">Learn More</a>
              </Button>
            </div>
          </div>
        </div>

        <div className="relative hidden items-center justify-center overflow-hidden border-l border-border md:flex">
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(91,46,230,0.08)_1px,transparent_1px),linear-gradient(0deg,rgba(91,46,230,0.08)_1px,transparent_1px)] bg-[size:42px_42px]" />
          <div className="absolute bottom-16 h-44 w-96 rounded-[50%] border border-primary/25" />
          <div className="absolute bottom-24 h-28 w-72 rounded-[50%] border border-primary/20" />
          <div className="absolute bottom-32 h-14 w-48 rounded-[50%] border border-primary/30" />
          <div className="relative grid place-items-center">
            <Shield className="h-44 w-44 stroke-[1.35] text-primary" />
            <div className="mt-4 h-2 w-36 rounded-full bg-primary/20 blur-sm" />
          </div>
          {Array.from({ length: 28 }).map((_, index) => (
            <span
              key={index}
              className="absolute h-1 w-1 rounded-full bg-primary/45"
              style={{
                left: `${22 + ((index * 13) % 56)}%`,
                top: `${18 + ((index * 19) % 62)}%`,
              }}
            />
          ))}
        </div>
      </section>
    </main>
  );
}
