import { Badge } from "@/components/ui/badge";

import type { Project } from "@/lib/projects";
export function ProjectHeader({
  project,
}: {
  project: Project;
}) {
  return (
    <div className="rounded-3xl border bg-card p-8">
      <div className="space-y-4">
        <Badge
          variant="secondary"
          className="w-fit rounded-full"
        >
          {project.status}
        </Badge>

        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            {project.name}
          </h1>

          <p className="mt-2 max-w-3xl text-muted-foreground">
            {project.objective}
          </p>
        </div>
      </div>
    </div>
  );
}