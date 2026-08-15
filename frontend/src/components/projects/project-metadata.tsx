import {
  CalendarDays,
  CheckCircle2,
  FolderKanban,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

export function ProjectMetadata({
  status,
  deadline,
  createdBy,
}: {
  status: string;
  deadline: string | null;
  createdBy: number;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardContent className="p-6">
          <FolderKanban className="mb-3 h-5 w-5 text-muted-foreground" />

          <p className="text-sm text-muted-foreground">
            Status
          </p>

          <p className="mt-2 text-3xl font-semibold capitalize">
            {status}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <CheckCircle2 className="mb-3 h-5 w-5 text-muted-foreground" />

          <p className="text-sm text-muted-foreground">
            Created By
          </p>

          <p className="mt-2 text-3xl font-semibold">
            #{createdBy}
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
            {deadline
              ? new Date(deadline).toLocaleDateString()
              : "No deadline"}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}