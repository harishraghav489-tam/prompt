"use client";

import { FileText, Folder } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { Resource } from "@/types";

interface ResourceViewerProps {
  resources: Resource[];
}

export function ResourceViewer({ resources }: ResourceViewerProps) {
  if (resources.length === 0) {
    return (
      <Card className="border-0 shadow-none">
        <CardContent className="flex min-h-[420px] flex-col items-center justify-center py-20 text-center">
          <div className="mb-8">
            <Folder className="h-16 w-16 stroke-[1.5] text-[#10152f]" />
          </div>
          <p className="text-sm font-black text-[#10152f]">
            No resources available yet
          </p>
          <p className="mt-4 max-w-xs text-sm leading-6 text-slate-600">
            Study materials will be uploaded by the admin.
          </p>
          <p className="mt-5 text-sm font-bold text-primary">
            Supported formats: Markdown, JSON, PDF
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {resources.map((resource) => (
        <Card key={resource.id} className="shadow-none">
          <CardContent className="space-y-3 p-6">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium">{resource.title}</p>
                <p className="text-xs uppercase text-muted-foreground">
                  {resource.type}
                </p>
              </div>
            </div>
            <a
              href={resource.url}
              className="text-sm font-medium text-primary hover:underline"
              target="_blank"
              rel="noreferrer"
            >
              Open resource
            </a>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
