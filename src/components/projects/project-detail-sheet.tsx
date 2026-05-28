"use client";

import { CalendarDays, CheckCircle2, FolderKanban, Users } from "lucide-react";

import type { Project, Ticket } from "@/lib/types";
import { tickets } from "@/lib/mock-data";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";

function MetricCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border p-4">
      <div className="mb-2 flex items-center gap-2 text-muted-foreground">
        <Icon className="h-4 w-4" />
        <span className="text-sm">{label}</span>
      </div>
      <p className="text-lg font-semibold">{value}</p>
    </div>
  );
}

export function ProjectDetailSheet({
  project,
  open,
  onOpenChange,
}: {
  project: Project | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const relatedTickets = tickets.filter((ticket) => ticket.projectId === project?.id);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl">
        {project ? (
          <div className="space-y-6 pt-6">
            <SheetHeader className="space-y-3">
              <Badge variant="secondary" className="w-fit rounded-full capitalize">
                {project.status}
              </Badge>
              <SheetTitle className="text-2xl">{project.name}</SheetTitle>
              <SheetDescription>{project.description}</SheetDescription>
            </SheetHeader>

            <Separator />

            <div className="grid grid-cols-2 gap-3">
              <MetricCard icon={FolderKanban} label="Progress" value={`${project.progress}%`} />
              <MetricCard icon={CalendarDays} label="Due" value={project.dueDate} />
              <MetricCard icon={Users} label="Members" value={String(project.members.length)} />
              <MetricCard icon={CheckCircle2} label="Status" value={project.status} />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium">{project.progress}%</span>
              </div>
              <Progress value={project.progress} className="h-2" />
            </div>

            <div className="space-y-3">
              <p className="text-sm font-medium">Team</p>
              <div className="flex flex-wrap gap-2">
                {project.members.map((member) => (
                  <div
                    key={member.name}
                    className="flex items-center gap-2 rounded-full border px-3 py-2"
                  >
                    <Avatar className="h-7 w-7">
                      <AvatarFallback className="text-[10px] font-medium">
                        {member.initials}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{member.name}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-medium">Related tickets</p>
              <div className="space-y-3">
                {relatedTickets.length > 0 ? (
                  relatedTickets.map((ticket: Ticket) => (
                    <div key={ticket.id} className="rounded-2xl border p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-medium">{ticket.key}</p>
                          <p className="text-sm text-muted-foreground">{ticket.title}</p>
                        </div>
                        <Badge variant="outline" className="rounded-full capitalize">
                          {ticket.status}
                        </Badge>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-2xl border border-dashed p-4 text-sm text-muted-foreground">
                    No tickets linked yet.
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}