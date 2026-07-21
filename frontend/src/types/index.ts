export type UserRole = "participant" | "admin";

export interface User {
  id: string;
  email: string;
  name: string;
  college: string;
  department: string;
  role: UserRole;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface LoginPayload {
  email: string;
  password?: string;
  provider?: "google";
}

export interface RegisterPayload {
  email: string;
  password: string;
  name: string;
  college: string;
  department: string;
}

export interface TimerConfig {
  preparationSecondsRemaining: number;
  submissionSecondsRemaining: number;
  challengeUnlocked: boolean;
}

export type ResourceType = "markdown" | "json" | "pdf" | "all";

export interface Resource {
  id: string;
  title: string;
  type: "markdown" | "json" | "pdf";
  url: string;
  uploadedAt: string;
}

export type Difficulty = "EASY" | "MEDIUM" | "HARD";

export interface Challenge {
  id: string;
  title: string;
  difficulty: Difficulty;
  problemStatement: string;
  imageUrl: string;
  submissionSecondsRemaining: number;
}

export interface PromptSubmission {
  id: string;
  challengeId: string;
  prompt: string;
  submittedAt: string;
  status: "pending" | "evaluated";
  score?: number;
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  college: string;
  department: string;
  score: number;
  isCurrentUser?: boolean;
}

export interface AdminStats {
  totalParticipants: number;
  totalSubmissions: number;
  evaluated: number;
  pending: number;
}

export interface AdminSubmission {
  id: string;
  name: string;
  college: string;
  submittedAt: string;
  status: "evaluated" | "pending";
  score?: number;
}

export interface Participant {
  id: string;
  name: string;
  email: string;
  college: string;
  department: string;
  registeredAt: string;
}

export interface CreateChallengePayload {
  title: string;
  difficulty: Difficulty;
  problemStatement: string;
  image: File;
  preparationTimerMinutes: number;
  submissionTimerMinutes: number;
}

export interface UploadResourcePayload {
  title: string;
  file: File;
}

export interface FileManifestEntry {
  id: string;
  path: string;
  category: string;
  reason: string;
  description: string;
}

export interface ApiError {
  detail: string;
  status: number;
}
