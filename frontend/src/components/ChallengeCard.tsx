import Link from "next/link";
import { Lock, LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ChallengeCardProps {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  locked?: boolean;
  actionLabel?: string;
}

export function ChallengeCard({
  title,
  description,
  href,
  icon: Icon,
  locked = false,
  actionLabel = "View",
}: ChallengeCardProps) {
  return (
    <Card className={cn("shadow-none", locked && "opacity-70")}>
      <CardContent className="flex h-full flex-col gap-4 p-5">
        <div className="flex items-start justify-between">
          <div className="rounded-md border border-primary/20 bg-primary/5 p-2">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          {locked ? <Lock className="h-4 w-4 text-muted-foreground" /> : null}
        </div>
        <div className="space-y-2">
          <h3 className="text-sm font-black uppercase">{title}</h3>
          <p className="text-xs leading-5 text-slate-600">{description}</p>
        </div>
        {locked ? (
          <Button variant="secondary" disabled className="mt-auto w-fit">
            Locked
          </Button>
        ) : (
          <Button asChild variant="outline" className="mt-auto w-fit">
            <Link href={href}>{actionLabel}</Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
