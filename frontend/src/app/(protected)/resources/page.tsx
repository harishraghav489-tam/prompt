"use client";

import { useEffect, useState } from "react";
import { ResourceViewer } from "@/components/ResourceViewer";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { resourcesApi } from "@/lib/api";
import type { Resource } from "@/types";

export default function ResourcesPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchResources = async () => {
      setIsLoading(true);
      try {
        const { data } = await resourcesApi.list("all");
        setResources(data);
      } catch {
        setResources([]);
      } finally {
        setIsLoading(false);
      }
    };

    void fetchResources();
  }, []);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black">Resources</h1>
          <p className="mt-3 text-xs font-bold text-slate-600">
            All study materials will be available here.
          </p>
        </div>
        <select className="h-10 rounded-md border border-border bg-white px-3 text-sm font-semibold">
          <option>All</option>
        </select>
      </div>

      {isLoading ? (
        <LoadingSpinner label="Loading resources..." />
      ) : (
        <ResourceViewer resources={resources} />
      )}
    </div>
  );
}
