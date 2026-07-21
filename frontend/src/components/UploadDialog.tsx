"use client";

import { Upload } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { siteConfig } from "@/config/site";

interface UploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  accept: string;
  onUpload: (file: File, meta?: { title?: string }) => Promise<void> | void;
  showTitleField?: boolean;
}

export function UploadDialog({
  open,
  onOpenChange,
  title,
  description,
  accept,
  onUpload,
  showTitleField = true,
}: UploadDialogProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [resourceTitle, setResourceTitle] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleSubmit = async () => {
    if (!selectedFile) return;
    setIsUploading(true);
    try {
      await onUpload(selectedFile, { title: resourceTitle || selectedFile.name });
      setSelectedFile(null);
      setResourceTitle("");
      onOpenChange(false);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {showTitleField ? (
            <div className="space-y-2">
              <Label htmlFor="upload-title">Title</Label>
              <Input
                id="upload-title"
                placeholder="Enter resource title"
                value={resourceTitle}
                onChange={(event) => setResourceTitle(event.target.value)}
              />
            </div>
          ) : null}

          <div
            className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-primary/30 bg-muted/20 px-6 py-10 text-center transition hover:border-primary/50 hover:bg-primary/5"
            onClick={() => inputRef.current?.click()}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                inputRef.current?.click();
              }
            }}
            role="button"
            tabIndex={0}
          >
            <Upload className="mb-3 h-8 w-8 text-primary" />
            <p className="font-medium">Click to select a file</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Supported: {siteConfig.supportedUploadFormats.documents.join(", ")}
            </p>
            {selectedFile ? (
              <p className="mt-3 text-sm text-primary">{selectedFile.name}</p>
            ) : null}
          </div>

          <input
            ref={inputRef}
            type="file"
            accept={accept}
            className="hidden"
            onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => void handleSubmit()}
            disabled={!selectedFile || isUploading}
          >
            {isUploading ? "Uploading..." : "Upload"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
