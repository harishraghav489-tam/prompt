import { apiClient } from "./client";
import { supabase } from "@/lib/supabase/client";
import type {
  AdminStats,
  AdminSubmission,
  CreateChallengePayload,
  Participant,
  UploadResourcePayload,
} from "@/types";

export const adminApi = {
  getStats: async () => {
    if (supabase) {
      const [profiles, submissions, evaluated, pending] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("submissions").select("id", { count: "exact", head: true }),
        supabase
          .from("submissions")
          .select("id", { count: "exact", head: true })
          .eq("status", "evaluated"),
        supabase
          .from("submissions")
          .select("id", { count: "exact", head: true })
          .eq("status", "pending"),
      ]);

      return {
        data: {
          totalParticipants: profiles.count ?? 0,
          totalSubmissions: submissions.count ?? 0,
          evaluated: evaluated.count ?? 0,
          pending: pending.count ?? 0,
        },
      };
    }

    return apiClient.get<AdminStats>("/admin/stats");
  },

  getRecentSubmissions: async () => {
    if (supabase) {
      const { data, error } = await supabase
        .from("submissions")
        .select(
          "id, submitted_at, status, score, profiles(name, college)"
        )
        .order("submitted_at", { ascending: false })
        .limit(8);

      if (!error && data) {
        return {
          data: data.map((submission) => {
            const profile = Array.isArray(submission.profiles)
              ? submission.profiles[0]
              : submission.profiles;
            return {
              id: submission.id,
              name: profile?.name ?? "Participant",
              college: profile?.college ?? "College",
              submittedAt: submission.submitted_at,
              status: submission.status,
              score: submission.score ?? undefined,
            };
          }),
        };
      }
    }

    return apiClient.get<AdminSubmission[]>("/admin/submissions/recent");
  },

  getSubmissions: () => apiClient.get<AdminSubmission[]>("/admin/submissions"),

  getParticipants: () => apiClient.get<Participant[]>("/admin/participants"),

  createChallenge: (payload: CreateChallengePayload) => {
    const formData = new FormData();
    formData.append("title", payload.title);
    formData.append("difficulty", payload.difficulty);
    formData.append("problemStatement", payload.problemStatement);
    formData.append("image", payload.image);
    formData.append(
      "preparationTimerMinutes",
      String(payload.preparationTimerMinutes)
    );
    formData.append(
      "submissionTimerMinutes",
      String(payload.submissionTimerMinutes)
    );
    return apiClient.post("/admin/challenges", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  uploadResource: (payload: UploadResourcePayload) => {
    const formData = new FormData();
    formData.append("title", payload.title);
    formData.append("file", payload.file);
    return apiClient.post("/admin/resources", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  updateChallenge: (id: string, data: Partial<CreateChallengePayload>) =>
    apiClient.patch(`/admin/challenges/${id}`, data),

  configureTimers: (preparationMinutes: number, submissionMinutes: number) =>
    apiClient.post("/admin/timers", { preparationMinutes, submissionMinutes }),
};

export { apiClient } from "./client";
