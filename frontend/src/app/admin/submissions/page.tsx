"use client";

import { useEffect, useState } from "react";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { adminApi } from "@/lib/api";
import type { AdminSubmission } from "@/types";

export default function AdminSubmissionsPage() {
  const [submissions, setSubmissions] = useState<AdminSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSubmissions = async () => {
      setIsLoading(true);
      try {
        const { data } = await adminApi.getSubmissions();
        setSubmissions(data);
      } catch {
        setSubmissions([]);
      } finally {
        setIsLoading(false);
      }
    };

    void fetchSubmissions();
  }, []);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <h1 className="text-2xl font-bold">Submissions</h1>
      {isLoading ? (
        <LoadingSpinner label="Loading submissions..." />
      ) : submissions.length > 0 ? (
        <div className="overflow-hidden rounded-xl border border-primary/20">
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
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-primary/20 py-20 text-center text-muted-foreground">
          No submissions yet.
        </div>
      )}
    </div>
  );
}
