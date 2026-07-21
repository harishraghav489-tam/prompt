import { apiClient } from "./client";
import type { Challenge, TimerConfig } from "@/types";

export const challengeApi = {
  getTimer: () => apiClient.get<TimerConfig>("/challenge/timer"),

  getActive: () => apiClient.get<Challenge>("/challenge/active"),

  getById: (id: string) => apiClient.get<Challenge>(`/challenge/${id}`),
};
