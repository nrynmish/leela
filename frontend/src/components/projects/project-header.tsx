import { Badge } from "@/components/ui/badge";

import type { Project } from "@/lib/projects";
export function ProjectHeader({
  project,
}: {
  project: Project;
}) {
  return (
    <div className="rounded-[24px] border border-[#262626] bg-[#141414] p-8">
      <div className="space-y-4">
        <Badge
          variant="secondary"
          className="w-fit rounded-full border-[#303030] bg-[#1A1A1A] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#D7D7D7]"
        >
          {project.status}
        </Badge>

        <div>
          <h1 className="text-3xl font-semibold tracking-[-0.04em] text-white">
            {project.name}
          </h1>

          <p className="mt-2 max-w-3xl text-[#A0A0A0]">
            {project.objective}
          </p>
        </div>
      </div>
    </div>
  );
}