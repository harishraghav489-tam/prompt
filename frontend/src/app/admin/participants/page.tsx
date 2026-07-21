"use client";

import { useEffect, useState } from "react";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { adminApi } from "@/lib/api";
import type { Participant } from "@/types";

export default function AdminParticipantsPage() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchParticipants = async () => {
      setIsLoading(true);
      try {
        const { data } = await adminApi.getParticipants();
        setParticipants(data);
      } catch {
        setParticipants([]);
      } finally {
        setIsLoading(false);
      }
    };

    void fetchParticipants();
  }, []);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <h1 className="text-2xl font-bold">Participants</h1>
      {isLoading ? (
        <LoadingSpinner label="Loading participants..." />
      ) : participants.length > 0 ? (
        <div className="overflow-hidden rounded-xl border border-primary/20">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>College</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Registered</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {participants.map((participant) => (
                <TableRow key={participant.id}>
                  <TableCell>{participant.name}</TableCell>
                  <TableCell>{participant.email}</TableCell>
                  <TableCell>{participant.college}</TableCell>
                  <TableCell>{participant.department}</TableCell>
                  <TableCell>{participant.registeredAt}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-primary/20 py-20 text-center text-muted-foreground">
          Registered participants will appear here.
        </div>
      )}
    </div>
  );
}
