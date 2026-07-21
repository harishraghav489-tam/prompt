"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Check,
  ChevronDown,
  ChevronRight,
  FileCode2,
  Shield,
  X,
} from "lucide-react";
import { PublicNavbar } from "@/components/layout/Navbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import {
  fileManifest,
  implementationSteps,
} from "@/config/file-manifest";
import { cn } from "@/lib/utils";

type PermissionState = "pending" | "approved" | "rejected";

export default function ImplementationPage() {
  const { toast } = useToast();
  const [permissions, setPermissions] = useState<Record<string, PermissionState>>(
    () =>
      Object.fromEntries(
        fileManifest.map((file) => [file.id, "pending" as PermissionState])
      )
  );
  const [expandedCategories, setExpandedCategories] = useState<string[]>([
    "Pages",
    "Components",
    "API",
  ]);

  const categories = useMemo(
    () => [...new Set(fileManifest.map((file) => file.category))],
    []
  );

  const stats = useMemo(() => {
    const values = Object.values(permissions);
    return {
      approved: values.filter((value) => value === "approved").length,
      rejected: values.filter((value) => value === "rejected").length,
      pending: values.filter((value) => value === "pending").length,
    };
  }, [permissions]);

  const setPermission = (id: string, state: PermissionState) => {
    setPermissions((current) => ({ ...current, [id]: state }));
    const file = fileManifest.find((entry) => entry.id === id);
    toast({
      title: state === "approved" ? "File approved" : "File rejected",
      description: file?.path,
      variant: state === "approved" ? "success" : "destructive",
    });
  };

  const approveAll = () => {
    setPermissions(
      Object.fromEntries(
        fileManifest.map((file) => [file.id, "approved" as PermissionState])
      )
    );
    toast({
      title: "All files approved",
      description: "The full Prompt War frontend architecture is approved.",
      variant: "success",
    });
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories((current) =>
      current.includes(category)
        ? current.filter((item) => item !== category)
        : [...current, category]
    );
  };

  return (
    <div className="grid-bg min-h-screen">
      <PublicNavbar />

      <main className="mx-auto max-w-6xl space-y-8 px-4 py-10 md:px-8">
        <section className="space-y-4">
          <Badge>Implementation Guide</Badge>
          <h1 className="text-4xl font-bold">How Prompt War Works</h1>
          <p className="max-w-3xl text-muted-foreground">
            This page documents the frontend architecture, explains each file in
            the codebase, and lets you approve or reject every generated file
            before development continues. Admin access is never shown in the
            participant UI — the backend assigns roles via JWT and returns 403 for
            unauthorized admin routes.
          </p>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground">Approved</p>
              <p className="text-3xl font-bold text-primary">{stats.approved}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground">Pending</p>
              <p className="text-3xl font-bold">{stats.pending}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground">Rejected</p>
              <p className="text-3xl font-bold text-orange-400">{stats.rejected}</p>
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Architecture Flow</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <div className="rounded-lg border border-primary/20 bg-muted/20 p-4 font-mono text-xs leading-6 text-primary">
                Landing → Login/Register → JWT Auth → Dashboard
                <br />
                Dashboard → Resources | Challenge (locked) | Leaderboard
                <br />
                Challenge unlocks → Monaco Editor → Submit → Confirmation
                <br />
                Admin (403 protected) → Stats | Uploads | Submissions
              </div>
              <div className="flex items-start gap-3">
                <Shield className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <p>
                  Role protection: participants hitting <code>/admin</code> are
                  redirected to <code>/dashboard</code> when the FastAPI backend
                  returns 403 Forbidden.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Build Steps</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {implementationSteps.map((step) => (
                <div key={step.step} className="flex gap-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-sm font-bold text-primary">
                    {step.step}
                  </div>
                  <div>
                    <p className="font-medium">{step.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>

        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-2xl font-bold">File Permission Manifest</h2>
            <div className="flex gap-3">
              <Button variant="outline" onClick={approveAll}>
                Approve All
              </Button>
              <Button asChild>
                <Link href="/">Back to Home</Link>
              </Button>
            </div>
          </div>

          {categories.map((category) => {
            const files = fileManifest.filter((file) => file.category === category);
            const isExpanded = expandedCategories.includes(category);

            return (
              <Card key={category}>
                <button
                  type="button"
                  className="flex w-full items-center justify-between px-6 py-4 text-left"
                  onClick={() => toggleCategory(category)}
                >
                  <div className="flex items-center gap-3">
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4 text-primary" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-primary" />
                    )}
                    <span className="font-semibold">{category}</span>
                    <Badge variant="secondary">{files.length} files</Badge>
                  </div>
                </button>

                {isExpanded ? (
                  <CardContent className="space-y-4 border-t border-primary/10 pt-4">
                    {files.map((file) => {
                      const state = permissions[file.id];

                      return (
                        <div
                          key={file.id}
                          className={cn(
                            "rounded-xl border p-4 transition",
                            state === "approved" && "border-primary/40 bg-primary/5",
                            state === "rejected" && "border-orange-500/30 bg-orange-500/5",
                            state === "pending" && "border-border"
                          )}
                        >
                          <div className="flex flex-wrap items-start justify-between gap-4">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <FileCode2 className="h-4 w-4 text-primary" />
                                <code className="text-sm text-primary">{file.path}</code>
                              </div>
                              <p className="text-sm font-medium">{file.description}</p>
                              <p className="text-sm text-muted-foreground">
                                <span className="font-medium text-foreground">Why: </span>
                                {file.reason}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant={state === "approved" ? "default" : "outline"}
                                className="gap-1"
                                onClick={() => setPermission(file.id, "approved")}
                              >
                                <Check className="h-3 w-3" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant={state === "rejected" ? "destructive" : "outline"}
                                className="gap-1"
                                onClick={() => setPermission(file.id, "rejected")}
                              >
                                <X className="h-3 w-3" />
                                Reject
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </CardContent>
                ) : null}
              </Card>
            );
          })}
        </section>
      </main>
    </div>
  );
}
