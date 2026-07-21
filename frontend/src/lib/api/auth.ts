import { apiClient } from "./client";
import type {
  AuthResponse,
  LoginPayload,
  RegisterPayload,
  User,
} from "@/types";

export const authApi = {
  login: (payload: LoginPayload) =>
    apiClient.post<AuthResponse>("/auth/login", payload),

  register: (payload: RegisterPayload) =>
    apiClient.post<AuthResponse>("/auth/register", payload),

  logout: () => apiClient.post("/auth/logout"),

  me: () => apiClient.get<User>("/auth/me"),

  forgotPassword: (email: string) =>
    apiClient.post("/auth/forgot-password", { email }),
};
