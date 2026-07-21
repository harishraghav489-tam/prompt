"use client";

import { useState } from "react";
import { Upload } from "lucide-react";
import { UploadDialog } from "@/components/UploadDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { adminApi } from "@/lib/api";
import { siteConfig } from "@/config/site";
import type { Difficulty } from "@/types";

export default function AdminChallengesPage() {
  const { toast } = useToast();
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [challengeImage, setChallengeImage] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: "Challenge 01",
    difficulty: "MEDIUM" as Difficulty,
    problemStatement: "",
    preparationTimerMinutes: 60,
    submissionTimerMinutes: 90,
  });

  const handleCreateChallenge = async () => {
    if (!challengeImage) {
      toast({
        title: "Image required",
        description: "Upload a challenge reference image.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await adminApi.createChallenge({
        ...form,
        image: challengeImage,
      });
      toast({
        title: "Challenge created",
        description: "Challenge has been saved and timers configured.",
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Creation failed",
        description:
          error instanceof Error ? error.message : "Could not create challenge",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <h1 className="text-2xl font-bold">Challenges</h1>

      <Card>
        <CardHeader>
          <CardTitle>Create Challenge</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="title">Challenge Title</Label>
              <Input
                id="title"
                value={form.title}
                onChange={(event) =>
                  setForm((current) => ({ ...current, title: event.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Difficulty</Label>
              <Select
                value={form.difficulty}
                onValueChange={(value) =>
                  setForm((current) => ({
                    ...current,
                    difficulty: value as Difficulty,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EASY">Easy</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="HARD">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="problem">Problem Statement</Label>
            <Textarea
              id="problem"
              rows={6}
              placeholder="Describe what participants must achieve with their prompt..."
              value={form.problemStatement}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  problemStatement: event.target.value,
                }))
              }
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="prep">Preparation Timer (minutes)</Label>
              <Input
                id="prep"
                type="number"
                min={1}
                value={form.preparationTimerMinutes}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    preparationTimerMinutes: Number(event.target.value),
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="submit">Submission Timer (minutes)</Label>
              <Input
                id="submit"
                type="number"
                min={1}
                value={form.submissionTimerMinutes}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    submissionTimerMinutes: Number(event.target.value),
                  }))
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Challenge Image</Label>
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => setImageDialogOpen(true)}
            >
              <Upload className="h-4 w-4" />
              {challengeImage ? challengeImage.name : "Upload Image"}
            </Button>
            <p className="text-xs text-muted-foreground">
              Supported: {siteConfig.supportedUploadFormats.images.join(", ")}
            </p>
          </div>

          <Button onClick={() => void handleCreateChallenge()} disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Create Challenge"}
          </Button>
        </CardContent>
      </Card>

      <UploadDialog
        open={imageDialogOpen}
        onOpenChange={setImageDialogOpen}
        title="Upload Challenge Image"
        description="Select a reference image for participants to recreate."
        accept={siteConfig.supportedUploadFormats.images.join(",")}
        showTitleField={false}
        onUpload={async (file) => {
          setChallengeImage(file);
        }}
      />
    </div>
  );
}
