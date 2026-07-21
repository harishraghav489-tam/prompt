import * as React from "react";
import { cn } from "@/lib/utils";

function Badge({
  className,
  variant = "default",
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  variant?: "default" | "secondary" | "outline" | "warning" | "success";
}) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide",
        {
          default: "border-primary/40 bg-primary/10 text-primary",
          secondary: "border-border bg-muted text-muted-foreground",
          outline: "border-primary/30 text-primary",
          warning: "border-orange-500/40 bg-orange-500/10 text-orange-400",
          success: "border-primary/40 bg-primary/10 text-primary",
        }[variant],
        className
      )}
      {...props}
    />
  );
}

export { Badge };
