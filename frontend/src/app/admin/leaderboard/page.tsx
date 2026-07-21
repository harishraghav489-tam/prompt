"use client";

import { useEffect, useState } from "react";
import { LeaderboardTable } from "@/components/LeaderboardTable";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { leaderboardApi } from "@/lib/api";
import type { LeaderboardEntry } from "@/types";

export default function AdminLeaderboardPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setIsLoading(true);
      try {
        const { data } = await leaderboardApi.get();
        setEntries(data);
      } catch {
        setEntries([]);
      } finally {
        setIsLoading(false);
      }
    };

    void fetchLeaderboard();
  }, []);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <h1 className="text-2xl font-bold">Leaderboard</h1>
      {isLoading ? (
        <LoadingSpinner label="Loading leaderboard..." />
      ) : entries.length > 0 ? (
        <LeaderboardTable entries={entries} />
      ) : (
        <div className="rounded-xl border border-dashed border-primary/20 py-20 text-center text-muted-foreground">
          Leaderboard will populate after submissions are evaluated.
        </div>
      )}
    </div>
  );
}
