import {
  CalendarDays,
  CheckCircle2,
  FolderKanban,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

export function ProjectMetadata({
  progress,
  deadline,
  ticketCount,
}: {
  progress: number;
  deadline: string;
  ticketCount: number;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardContent className="p-6">
          <FolderKanban className="mb-3 h-5 w-5 text-muted-foreground" />

          <p className="text-sm text-muted-foreground">
            Progress
          </p>

          <p className="mt-2 text-3xl font-semibold">
            {progress}%
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <CheckCircle2 className="mb-3 h-5 w-5 text-muted-foreground" />

          <p className="text-sm text-muted-foreground">
            Tickets
          </p>

          <p className="mt-2 text-3xl font-semibold">
            {ticketCount}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <CalendarDays className="mb-3 h-5 w-5 text-muted-foreground" />

          <p className="text-sm text-muted-foreground">
            Deadline
          </p>

          <p className="mt-2 text-lg font-medium">
            {deadline}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}