"use client";

import { useEffect, useState } from "react";
import { LeaderboardTable } from "@/components/LeaderboardTable";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { leaderboardApi } from "@/lib/api";
import type { LeaderboardEntry } from "@/types";

const fallbackEntries: LeaderboardEntry[] = [
  { rank: 1, name: "Arjun Sharma", college: "IIT Bombay", department: "-", score: 96.72 },
  { rank: 2, name: "Riya Patel", college: "NIT Trichy", department: "-", score: 94.18 },
  { rank: 3, name: "Kabir Singh", college: "IIIT Hyderabad", department: "-", score: 92.55 },
  { rank: 4, name: "Meera Nair", college: "BITS Pilani", department: "-", score: 91.03 },
  { rank: 5, name: "Aditya Verma", college: "DTU", department: "-", score: 89.66 },
  { rank: 0, name: "Your Rank", college: "Your College", department: "-", score: 0, isCurrentUser: true },
];

export default function LeaderboardPage() {
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
    <div className="mx-auto max-w-5xl space-y-8">
      <h1 className="text-2xl font-black">Leaderboard</h1>
      {isLoading ? (
        <LoadingSpinner label="Loading leaderboard..." />
      ) : (
        <LeaderboardTable entries={entries.length > 0 ? entries : fallbackEntries} />
      )}
    </div>
  );
}
