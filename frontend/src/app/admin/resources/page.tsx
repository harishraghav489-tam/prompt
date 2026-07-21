"use client";

import { useState } from "react";
import { Upload } from "lucide-react";
import { UploadDialog } from "@/components/UploadDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { adminApi } from "@/lib/api";
import { siteConfig } from "@/config/site";

export default function AdminResourcesPage() {
  const { toast } = useToast();
  const [uploadOpen, setUploadOpen] = useState(false);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Resources</h1>
        <Button className="gap-2" onClick={() => setUploadOpen(true)}>
          <Upload className="h-4 w-4" />
          Upload Resources
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Study Materials</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Upload study materials for participants. Supported formats: Markdown
            (.md), JSON (.json), and PDF (.pdf). Files will be served by the
            backend once integrated.
          </p>
        </CardContent>
      </Card>

      <UploadDialog
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        title="Upload Study Material"
        description="Select a file to make available in the Resources page."
        accept={siteConfig.supportedUploadFormats.documents.join(",")}
        onUpload={async (file, meta) => {
          try {
            await adminApi.uploadResource({
              title: meta?.title ?? file.name,
              file,
            });
            toast({
              title: "Upload queued",
              description: `${file.name} will be available after backend processing.`,
              variant: "success",
            });
          } catch (error) {
            toast({
              title: "Upload failed",
              description:
                error instanceof Error ? error.message : "Could not upload file",
              variant: "destructive",
            });
          }
        }}
      />
    </div>
  );
}
