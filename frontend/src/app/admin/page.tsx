"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  CheckCircle2,
  Clock,
  FileText,
  Plus,
  Upload,
  Users,
} from "lucide-react";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { adminApi } from "@/lib/api";
import type { AdminStats, AdminSubmission } from "@/types";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [submissions, setSubmissions] = useState<AdminSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [statsRes, submissionsRes] = await Promise.all([
          adminApi.getStats(),
          adminApi.getRecentSubmissions(),
        ]);
        setStats(statsRes.data);
        setSubmissions(submissionsRes.data);
      } catch {
        setStats(null);
        setSubmissions([]);
      } finally {
        setIsLoading(false);
      }
    };

    void fetchData();
  }, []);

  if (isLoading) {
    return <LoadingSpinner fullScreen label="Loading admin dashboard..." />;
  }

  const statCards = [
    {
      label: "Total Participants",
      value: stats?.totalParticipants ?? 0,
      icon: Users,
    },
    {
      label: "Total Submissions",
      value: stats?.totalSubmissions ?? 0,
      icon: FileText,
    },
    {
      label: "Evaluated",
      value: stats?.evaluated ?? 0,
      icon: CheckCircle2,
      accent: "text-primary",
    },
    {
      label: "Pending",
      value: stats?.pending ?? 0,
      icon: Clock,
      accent: "text-orange-400",
    },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
                <stat.icon className={`h-5 w-5 ${stat.accent ?? "text-primary"}`} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className={`text-2xl font-bold ${stat.accent ?? ""}`}>
                  {stat.value}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Recent Submissions</CardTitle>
          </CardHeader>
          <CardContent>
            {submissions.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>College</TableHead>
                    <TableHead>Submission Time</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Score</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {submissions.map((submission) => (
                    <TableRow key={submission.id}>
                      <TableCell>{submission.name}</TableCell>
                      <TableCell>{submission.college}</TableCell>
                      <TableCell>{submission.submittedAt}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            submission.status === "evaluated" ? "success" : "warning"
                          }
                        >
                          {submission.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {submission.score ?? "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Submissions will appear here once participants submit prompts.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button asChild className="w-full justify-start gap-2">
              <Link href="/admin/challenges">
                <Plus className="h-4 w-4" />
                Create Challenge
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start gap-2">
              <Link href="/admin/resources">
                <Upload className="h-4 w-4" />
                Upload Resources
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start gap-2">
              <Link href="/admin/leaderboard">
                <CheckCircle2 className="h-4 w-4" />
                View Leaderboard
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
