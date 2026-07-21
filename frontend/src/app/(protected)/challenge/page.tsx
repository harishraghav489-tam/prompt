"use client";

import Image from "next/image";
import {
  CheckCircle2,
  Expand,
  ExternalLink,
  Lock,
  Maximize2,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ConfirmationModal } from "@/components/ConfirmationModal";
import { CountdownTimer } from "@/components/CountdownTimer";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { PromptEditor } from "@/components/PromptEditor";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCountdown } from "@/hooks/useCountdown";
import { useToast } from "@/components/ui/use-toast";
import { challengeApi, submissionsApi } from "@/lib/api";
import { useAuth } from "@/lib/auth/auth-context";
import { estimateTokens, formatCountdown } from "@/lib/utils";
import type { Challenge } from "@/types";

const defaultProblemStatement =
  'Recreate the architectural style of a solarpunk metropolis with specific lighting constraints. Your goal is to prompt for high-key organic structures while maintaining the "golden hour" luminance as shown in the reference.';

export default function ChallengePage() {
  const router = useRouter();
  const { timer, refreshTimer } = useAuth();
  const { toast } = useToast();
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isChallengeBypass, setIsChallengeBypass] = useState(true);

  const preparationSeconds = useCountdown(
    timer?.preparationSecondsRemaining ?? 0,
    () => void refreshTimer()
  );
  const submissionSeconds = useCountdown(
    challenge?.submissionSecondsRemaining ??
      timer?.submissionSecondsRemaining ??
      0
  );
  const challengeLocked =
    preparationSeconds > 0 && !timer?.challengeUnlocked && !isChallengeBypass;

  const timeParts = formatCountdown(submissionSeconds);
  const tokenEstimate = estimateTokens(prompt);
  const lineCount = prompt ? prompt.split("\n").length : 0;
  const referenceImage = challenge?.imageUrl || "/solarpunk-reference.png";

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("promptwar_challenge_bypass", "1");
      setIsChallengeBypass(
        window.localStorage.getItem("promptwar_challenge_bypass") !== "0"
      );
    }

    const fetchChallenge = async () => {
      setIsLoading(true);
      try {
        const { data } = await challengeApi.getActive();
        setChallenge(data);
      } catch {
        setChallenge(null);
      } finally {
        setIsLoading(false);
      }
    };

    if (!challengeLocked) {
      void fetchChallenge();
    } else {
      setIsLoading(false);
    }
  }, [challengeLocked]);

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      isChallengeBypass &&
      !challengeLocked
    ) {
      window.localStorage.removeItem("promptwar_challenge_bypass");
    }
  }, [challengeLocked, isChallengeBypass]);

  const handleSubmit = async () => {
    if (!challenge || !prompt.trim()) {
      toast({
        title: "Prompt required",
        description: "Enter your prompt before submitting.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await submissionsApi.submit(challenge.id, prompt);
      setShowConfirmation(true);
    } catch (error) {
      toast({
        title: "Submission failed",
        description:
          error instanceof Error ? error.message : "Could not submit prompt",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (challengeLocked) {
    return (
      <div className="mx-auto flex max-w-3xl flex-col items-center justify-center py-20 text-center">
        <div className="mb-6 rounded-full border border-primary/20 bg-primary/5 p-6">
          <Lock className="h-10 w-10 text-primary" />
        </div>
        <h1 className="mb-2 text-2xl font-black">Challenge Locked</h1>
        <p className="mb-8 text-slate-600">
          The challenge will unlock when preparation time ends.
        </p>
        <CountdownTimer
          totalSeconds={preparationSeconds}
          label="Preparation Time Remaining"
        />
        <Button
          className="mt-8"
          variant="outline"
          onClick={() => router.push("/dashboard")}
        >
          Back to Dashboard
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return <LoadingSpinner fullScreen label="Loading challenge..." />;
  }

  return (
    <div className="mx-auto max-w-7xl space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-black">
            {challenge?.title ?? "Challenge 01"}
          </h1>
          <Badge variant="outline" className="border-primary/40 text-primary">
            {challenge?.difficulty ?? "MEDIUM"}
          </Badge>
        </div>
        <div className="flex items-center gap-6 text-sm">
          <div>
            <span className="font-semibold text-slate-600">Time Left</span>{" "}
            <span className="font-mono text-xl font-black text-primary">
              {timeParts.hours} : {timeParts.minutes} : {timeParts.seconds}
            </span>
          </div>
          <span className="flex items-center gap-2 text-sm font-semibold text-emerald-600">
            <CheckCircle2 className="h-4 w-4" /> Auto-saved
          </span>
          <Expand className="h-5 w-5 text-[#10152f]" />
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[390px_minmax(0,1fr)_170px]">
        <aside className="space-y-4">
          <Card className="shadow-none">
            <CardHeader className="p-4 pb-3">
              <CardTitle className="text-xs font-black uppercase text-primary">
                Reference Image
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="relative aspect-[16/9] overflow-hidden rounded-md bg-slate-100">
                <Image
                  src={referenceImage}
                  alt="Challenge reference"
                  fill
                  className="object-cover"
                  unoptimized={referenceImage.startsWith("http")}
                />
              </div>
              <Button variant="outline" size="sm" className="mt-3">
                <ExternalLink className="h-4 w-4" />
                View Original
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-none">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-xs font-black uppercase">
                Problem Statement
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <p className="whitespace-pre-wrap text-sm leading-7 text-[#10152f]">
                {challenge?.problemStatement ?? defaultProblemStatement}
              </p>
            </CardContent>
          </Card>
        </aside>

        <section className="min-w-0">
          <Card className="shadow-none">
            <CardHeader className="p-4 pb-3">
              <CardTitle className="text-xs font-black uppercase text-primary">
                Prompt Editor
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <PromptEditor value={prompt} onChange={setPrompt} />
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-sm text-[#10152f]">
                <div className="flex gap-8">
                  <span>Characters: {prompt.length}</span>
                  <span>Tokens (est.): {tokenEstimate}</span>
                </div>
                <div className="flex gap-4">
                  <Maximize2 className="h-5 w-5" />
                  <RefreshCw className="h-5 w-5" />
                  <Trash2 className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <aside className="space-y-4">
          <Card className="shadow-none">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-xs font-black uppercase text-primary">
                Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 p-4 pt-0">
              {[
                ["Characters", prompt.length],
                ["Tokens (est.)", tokenEstimate],
                ["Lines", lineCount],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-md border border-border bg-white p-3"
                >
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span>{label}</span>
                    <span>{value}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="shadow-none">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-xs font-black uppercase">
                Prompt Quality
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 text-center">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border-4 border-slate-200 text-lg font-black">
                -<span className="text-xs">/10</span>
              </div>
              <p className="mt-4 text-xs font-medium leading-5 text-slate-600">
                Start writing to see quality score
              </p>
              <Button
                className="mt-4 w-full text-xs"
                onClick={() => void handleSubmit()}
                disabled={isSubmitting || !prompt.trim()}
              >
                {isSubmitting ? "Submitting..." : "Submit Prompt"}
              </Button>
              <p className="mt-3 text-[11px] font-semibold text-[#10152f]">
                You can submit only once
              </p>
            </CardContent>
          </Card>
        </aside>
      </div>

      <ConfirmationModal
        open={showConfirmation}
        onOpenChange={setShowConfirmation}
        title="Prompt Submitted Successfully!"
        description="Your prompt is being evaluated. Your score will appear on the leaderboard once evaluation is complete."
      />
    </div>
  );
}
