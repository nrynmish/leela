"use client";

import {
  ArrowUpRight,
  CalendarDays,
  CircleDot,
  Ticket,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";

import type { Project } from "@/lib/projects";

interface ProjectCardProps {
  project: Project;
  onOpen: React.Dispatch<React.SetStateAction<Project | null>>;
}

const statusMap: Record<
  string,
  {
    label: string;
    className: string;
    dot: string;
  }
> = {
  active: {
    label: "ACTIVE",
    className:
      "border-[#CBFF3D]/20 bg-[#CBFF3D]/10 text-[#CBFF3D]",
    dot: "bg-[#CBFF3D]",
  },
  paused: {
    label: "PAUSED",
    className:
      "border-[#555]/30 bg-[#222] text-[#999]",
    dot: "bg-[#888]",
  },
  done: {
    label: "DONE",
    className:
      "border-white/10 bg-white/[0.05] text-[#AAA]",
    dot: "bg-[#AAA]",
  },
};

function formatDeadline(deadline: string | null) {
  if (!deadline) {
    return "No deadline";
  }

  return new Date(deadline).toLocaleDateString(
    undefined,
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    },
  );
}

export function ProjectCard({
  project,
  onOpen,
}: ProjectCardProps) {
  const status =
    statusMap[project.status] ?? statusMap.paused;

  return (
    <Card className="overflow-hidden rounded-[18px] border-[#262626] bg-[#141414] text-white transition-all hover:border-[#3A3A3A] hover:bg-[#181818]">
      <CardHeader className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="truncate font-medium">
                {project.name}
              </h3>

              <Badge
                variant="outline"
                className={`rounded-full px-2 py-0.5 text-[9px] font-semibold tracking-wider ${status.className}`}
              >
                <span
                  className={`mr-1.5 h-1.5 w-1.5 rounded-full ${status.dot}`}
                />
                {status.label}
              </Badge>
            </div>

            <p className="line-clamp-2 text-sm text-[#777]">
              {project.description}
            </p>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 rounded-full text-[#666] hover:bg-[#1A1A1A] hover:text-white"
            onClick={() => onOpen(project)}
          >
            <ArrowUpRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <div className="flex items-center gap-1 border-t border-[#242424] pt-3 text-xs text-[#666]">
          <CalendarDays className="h-3.5 w-3.5" />

          {formatDeadline(project.deadline)}
        </div>

        <div className="mt-3 flex items-center gap-1 text-xs text-[#666]">
          <CircleDot className="h-3.5 w-3.5" />

          Created{" "}
          {new Date(
            project.created_at,
          ).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </div>

        <div className="mt-4">
          <Button
            variant="outline"
            className="w-full rounded-full border-[#303030] bg-[#1A1A1A] text-xs text-[#AAA] hover:bg-[#222] hover:text-white"
            onClick={() => onOpen(project)}
          >
            <Ticket className="mr-2 h-3.5 w-3.5" />
            Open project
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}