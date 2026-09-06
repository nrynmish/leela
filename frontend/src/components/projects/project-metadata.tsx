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
      <Card className="rounded-[20px] border-[#262626] bg-[#141414]">
        <CardContent className="p-6">
          <FolderKanban className="mb-3 h-5 w-5 text-[#CBFF3D]" />

          <p className="text-sm text-[#A0A0A0]">
            Status
          </p>

          <p className="mt-2 text-3xl font-semibold capitalize text-white">
            {status}
          </p>
        </CardContent>
      </Card>

      <Card className="rounded-[20px] border-[#262626] bg-[#141414]">
        <CardContent className="p-6">
          <CheckCircle2 className="mb-3 h-5 w-5 text-[#CBFF3D]" />

          <p className="text-sm text-[#A0A0A0]">
            Created By
          </p>

          <p className="mt-2 text-3xl font-semibold text-white">
            #{createdBy}
          </p>
        </CardContent>
      </Card>

      <Card className="rounded-[20px] border-[#262626] bg-[#141414]">
        <CardContent className="p-6">
          <CalendarDays className="mb-3 h-5 w-5 text-[#CBFF3D]" />

          <p className="text-sm text-[#A0A0A0]">
            Deadline
          </p>

          <p className="mt-2 text-lg font-medium text-white">
            {deadline
              ? new Date(deadline).toLocaleDateString()
              : "No deadline"}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}