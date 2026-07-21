"use client";

import { formatCountdown } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface CountdownTimerProps {
  totalSeconds: number;
  label?: string;
  variant?: "large" | "compact";
  className?: string;
}

export function CountdownTimer({
  totalSeconds,
  label,
  variant = "large",
  className,
}: CountdownTimerProps) {
  const { hours, minutes, seconds } = formatCountdown(totalSeconds);

  if (variant === "compact") {
    return (
      <div className={cn("flex items-center gap-2 text-sm", className)}>
        {label ? (
          <span className="text-muted-foreground">{label}</span>
        ) : null}
        <span className="font-mono font-semibold text-primary">
          {hours}:{minutes}:{seconds}
        </span>
      </div>
    );
  }

  return (
    <div className={cn("text-center", className)}>
      {label ? (
        <p className="mb-6 text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
          {label}
        </p>
      ) : null}
      <div className="flex items-center justify-center gap-3 font-mono text-4xl font-black text-primary md:text-5xl">
        <span>{hours}</span>
        <span className="text-primary/50">:</span>
        <span>{minutes}</span>
        <span className="text-primary/50">:</span>
        <span>{seconds}</span>
      </div>
      <div className="mt-3 flex items-center justify-center gap-9 text-[10px] font-bold uppercase text-slate-600">
        <span>Hours</span>
        <span>Minutes</span>
        <span>Seconds</span>
      </div>
    </div>
  );
}
