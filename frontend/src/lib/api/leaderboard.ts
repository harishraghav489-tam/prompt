import { apiClient } from "./client";
import type { LeaderboardEntry } from "@/types";

export const leaderboardApi = {
  get: () => apiClient.get<LeaderboardEntry[]>("/leaderboard"),

  getMyRank: () => apiClient.get<LeaderboardEntry>("/leaderboard/me"),
};
