import { apiClient } from "./client";
import { supabase } from "@/lib/supabase/client";
import type { PromptSubmission } from "@/types";

function toPromptSubmission(row: {
  id: string;
  challenge_id: string;
  prompt: string;
  submitted_at: string;
  status: "pending" | "evaluated";
  score: number | null;
}): PromptSubmission {
  return {
    id: row.id,
    challengeId: row.challenge_id,
    prompt: row.prompt,
    submittedAt: row.submitted_at,
    status: row.status,
    score: row.score ?? undefined,
  };
}

export const submissionsApi = {
  submit: async (challengeId: string, prompt: string) => {
    if (supabase) {
      const { data: authData } = await supabase.auth.getUser();
      const userId = authData.user?.id;
      if (userId) {
        const { data, error } = await supabase
          .from("submissions")
          .insert({
            challenge_id: challengeId,
            participant_id: userId,
            prompt,
            character_count: prompt.length,
            token_count: Math.ceil(prompt.length / 4),
            word_count: prompt.trim() ? prompt.trim().split(/\s+/).length : 0,
          })
          .select("id, challenge_id, prompt, submitted_at, status, score")
          .single();

        if (!error && data) {
          return { data: toPromptSubmission(data) };
        }
      }
    }

    return apiClient.post<PromptSubmission>("/submissions", {
      challengeId,
      prompt,
    });
  },

  getMine: async () => {
    if (supabase) {
      const { data: authData } = await supabase.auth.getUser();
      const userId = authData.user?.id;
      if (userId) {
        const { data, error } = await supabase
          .from("submissions")
          .select("id, challenge_id, prompt, submitted_at, status, score")
          .eq("participant_id", userId)
          .order("submitted_at", { ascending: false });

        if (!error && data) {
          return { data: data.map(toPromptSubmission) };
        }
      }
    }

    return apiClient.get<PromptSubmission[]>("/submissions/me");
  },

  getById: (id: string) =>
    apiClient.get<PromptSubmission>(`/submissions/${id}`),
};
