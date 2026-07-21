import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { LeaderboardEntry } from "@/types";
import { cn } from "@/lib/utils";

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
}

export function LeaderboardTable({ entries }: LeaderboardTableProps) {
  const regularEntries = entries.filter((entry) => !entry.isCurrentUser);
  const currentUserEntry = entries.find((entry) => entry.isCurrentUser);

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-white">
      <Table>
        <TableHeader>
          <TableRow className="border-border hover:bg-transparent">
            <TableHead className="text-[11px] font-black uppercase text-[#10152f]">Rank</TableHead>
            <TableHead className="text-[11px] font-black uppercase text-[#10152f]">Name</TableHead>
            <TableHead className="text-[11px] font-black uppercase text-[#10152f]">College</TableHead>
            <TableHead className="hidden text-[11px] font-black uppercase text-[#10152f] md:table-cell">Department</TableHead>
            <TableHead className="text-right">Score</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {regularEntries.map((entry) => (
            <TableRow key={`${entry.rank}-${entry.name}`}>
              <TableCell className="font-semibold">{entry.rank}</TableCell>
              <TableCell>{entry.name}</TableCell>
              <TableCell>{entry.college}</TableCell>
              <TableCell className="hidden md:table-cell">{entry.department}</TableCell>
              <TableCell className="text-right font-semibold text-primary">
                {entry.score}
              </TableCell>
            </TableRow>
          ))}
          {currentUserEntry ? (
            <TableRow
              className={cn(
                "border-t-2 border-primary/30 bg-primary/5 hover:bg-primary/5"
              )}
            >
              <TableCell className="font-semibold text-primary">
                {currentUserEntry.rank || "-"}
              </TableCell>
              <TableCell className="font-semibold text-primary">
                {currentUserEntry.name}
              </TableCell>
              <TableCell className="text-primary">
                {currentUserEntry.college}
              </TableCell>
              <TableCell className="hidden text-primary md:table-cell">
                {currentUserEntry.department}
              </TableCell>
              <TableCell className="text-right font-bold text-primary">
                {currentUserEntry.score || "-"}
              </TableCell>
            </TableRow>
          ) : null}
        </TableBody>
      </Table>
    </div>
  );
}
