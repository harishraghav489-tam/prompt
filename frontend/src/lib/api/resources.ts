import { apiClient } from "./client";
import type { Resource, ResourceType } from "@/types";

export const resourcesApi = {
  list: (filter: ResourceType = "all") =>
    apiClient.get<Resource[]>("/resources", { params: { filter } }),

  getById: (id: string) => apiClient.get<Resource>(`/resources/${id}`),

  download: (id: string) =>
    apiClient.get(`/resources/${id}/download`, { responseType: "blob" }),
};
