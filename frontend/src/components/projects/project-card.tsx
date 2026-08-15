"use client";

import { CalendarDays, MoreHorizontal } from "lucide-react";
import Link from "next/link";

import type { Project } from "@/lib/projects";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

const statusStyles: Record<
  Project["status"],
  string
> = {
  active:
    "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",

  paused:
    "border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400",

  done:
    "border-blue-500/20 bg-blue-500/10 text-blue-600 dark:text-blue-400",
};

export function ProjectCard({
  project,
  onOpen,
}: {
  project: Project;
  onOpen: (project: Project) => void;
}) {
  const deadline = project.deadline
    ? new Date(project.deadline).toLocaleDateString()
    : "No deadline";

  return (
    <Card className="group transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
      <CardHeader className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold tracking-tight">
                {project.name}
              </h3>

              <Badge
                variant="outline"
                className={cn(
                  "rounded-full capitalize",
                  statusStyles[project.status],
                )}
              >
                {project.status}
              </Badge>
            </div>

            <p className="text-sm text-muted-foreground">
              {project.description}
            </p>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="shrink-0"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onOpen(project);
            }}
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <CalendarDays className="h-3.5 w-3.5" />
          {deadline}
        </div>

        <Link href={`/projects/${project.id}`}>
          <Button
            variant="outline"
            className="w-full rounded-2xl"
          >
            View project
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}