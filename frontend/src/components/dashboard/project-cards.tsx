import Link from "next/link";
import {
  ArrowUpRight,
  CalendarDays,
  CircleDot,
  Ticket,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import type { Project } from "@/lib/projects";
import type { Ticket as TicketType } from "@/lib/tickets";

interface ProjectCardsProps {
  projects: Project[];
  tickets: TicketType[];
  loading: boolean;
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

export function ProjectCards({
  projects,
  tickets,
  loading,
}: ProjectCardsProps) {
  return (
    <section className="rounded-[20px] border border-[#262626] bg-[#0D0D0D] p-5">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <CircleDot className="h-4 w-4 text-[#CBFF3D]" />
            <h2 className="text-sm font-semibold">
              Project Overview
            </h2>
          </div>

          <p className="mt-1 text-xs text-[#666]">
            Current engineering workspaces
          </p>
        </div>

        <Link href="/projects">
          <Button
            variant="ghost"
            size="sm"
            className="rounded-full text-xs text-[#888] hover:bg-[#1A1A1A] hover:text-white"
          >
            View all
            <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="flex min-h-[300px] items-center justify-center rounded-2xl border border-[#262626] bg-[#141414]">
          <p className="text-xs text-[#666]">
            Loading projects...
          </p>
        </div>
      ) : projects.length === 0 ? (
        <div className="flex min-h-[300px] items-center justify-center rounded-2xl border border-dashed border-[#303030] bg-[#141414]">
          <div className="text-center">
            <p className="text-sm font-medium">
              No projects yet
            </p>

            <p className="mt-1 text-xs text-[#666]">
              Create a project to start tracking engineering work.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {projects.map((project) => {
            const projectTickets = tickets.filter(
              (ticket) => ticket.project_id === project.id,
            );

            const openCount = projectTickets.filter(
              (ticket) => ticket.status !== "done",
            ).length;

            const status =
              statusMap[project.status] ?? statusMap.paused;

            return (
              <Link
                key={project.id}
                href={`/projects/${project.id}`}
                className="group block"
              >
                <Card className="rounded-2xl border-[#262626] bg-[#141414] transition-all hover:border-[#444] hover:bg-[#181818]">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="truncate text-sm font-medium">
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

                        <p className="mt-2 line-clamp-1 text-xs text-[#777]">
                          {project.objective ||
                            project.description}
                        </p>
                      </div>

                      <ArrowUpRight className="h-4 w-4 shrink-0 text-[#555] transition group-hover:text-[#CBFF3D]" />
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-4 border-t border-[#242424] pt-3 text-[10px] text-[#666]">
                      <span className="flex items-center gap-1.5">
                        <Ticket className="h-3 w-3" />
                        {projectTickets.length} tickets
                      </span>

                      <span className="flex items-center gap-1.5">
                        <CircleDot className="h-3 w-3" />
                        {openCount} open
                      </span>

                      <span className="flex items-center gap-1.5">
                        <CalendarDays className="h-3 w-3" />
                        {formatDeadline(project.deadline)}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}