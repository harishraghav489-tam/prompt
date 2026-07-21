"use client";

import { BookOpen, Swords, Trophy } from "lucide-react";
import { ChallengeCard } from "@/components/ChallengeCard";
import { CountdownTimer } from "@/components/CountdownTimer";
import { Card, CardContent } from "@/components/ui/card";
import { useCountdown } from "@/hooks/useCountdown";
import { useAuth } from "@/lib/auth/auth-context";

export default function DashboardPage() {
  const { timer, refreshTimer } = useAuth();
  const preparationSeconds = useCountdown(
    timer?.preparationSecondsRemaining ?? 0,
    () => void refreshTimer()
  );
  const challengeLocked = preparationSeconds > 0;

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <Card className="shadow-none">
        <CardContent className="py-10 md:py-12">
          <CountdownTimer
            totalSeconds={preparationSeconds}
            label="Preparation Time Remaining"
          />
          <p className="mt-6 text-center text-sm text-slate-600">
            Challenge will unlock after preparation time ends.
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <ChallengeCard
          title="Resources"
          description="View study materials and reference docs"
          href="/resources"
          icon={BookOpen}
          actionLabel="View"
        />
        <ChallengeCard
          title="Challenge"
          description="Challenge will be available soon"
          href="/challenge"
          icon={Swords}
          locked={challengeLocked}
        />
        <ChallengeCard
          title="Leaderboard"
          description="See top performers"
          href="/leaderboard"
          icon={Trophy}
          actionLabel="View"
        />
      </div>
    </div>
  );
}
