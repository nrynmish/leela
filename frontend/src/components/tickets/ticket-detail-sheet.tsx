"use client";

import * as React from "react";
import {
  CalendarDays,
  FolderKanban,
  Save,
  Tag,
  UserRound,
} from "lucide-react";

import type { Priority, Ticket, TicketStatus } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";

type ProjectOption = {
  id: string;
  name: string;
};

type TicketFormState = {
  title: string;
  summary: string;
  status: TicketStatus;
  priority: Priority;
  projectId: string;
  assignee: string;
  labels: string;
};

const statusOptions: TicketStatus[] = [
  "backlog",
  "todo",
  "in-progress",
  "review",
  "done",
];

const priorityOptions: Priority[] = ["low", "medium", "high", "urgent"];

function initialsFromName(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function buildFormState(ticket: Ticket): TicketFormState {
  return {
    title: ticket.title,
    summary: ticket.summary,
    status: ticket.status,
    priority: ticket.priority,
    projectId: ticket.projectId,
    assignee: ticket.assignee.name,
    labels: ticket.labels.join(", "),
  };
}

export function TicketDetailSheet({
  ticket,
  projects,
  open,
  onOpenChange,
  onSave,
}: {
  ticket: Ticket | null;
  projects: ProjectOption[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (ticket: Ticket) => void;
}) {
  const [form, setForm] = React.useState<TicketFormState | null>(() =>
    ticket ? buildFormState(ticket) : null
  );
  const [error, setError] = React.useState<string | null>(null);

  const projectNameById = React.useMemo(() => {
    return new Map(projects.map((project) => [project.id, project.name]));
  }, [projects]);

  function handleClose() {
    onOpenChange(false);
    setError(null);
  }

  function updateField<K extends keyof TicketFormState>(
    key: K,
    value: TicketFormState[K]
  ) {
    setForm((current) => {
      if (!current) return current;
      return {
        ...current,
        [key]: value,
      };
    });
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!ticket || !form) return;

    const title = form.title.trim();
    const summary = form.summary.trim();

    if (!title || !summary || !form.projectId) {
      setError("Please fill in the title, summary, and project.");
      return;
    }

    const labels = form.labels
      .split(",")
      .map((label) => label.trim())
      .filter(Boolean);

    onSave({
      ...ticket,
      title,
      summary,
      status: form.status,
      priority: form.priority,
      projectId: form.projectId,
      assignee: {
        name: form.assignee,
        initials: initialsFromName(form.assignee),
      },
      labels,
    });

    handleClose();
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl">
        {ticket && form ? (
          <div className="flex h-full flex-col pt-6">
            <SheetHeader className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="rounded-full">
                  {ticket.key}
                </Badge>
                <Badge variant="secondary" className="rounded-full capitalize">
                  {form.status}
                </Badge>
                <Badge variant="secondary" className="rounded-full capitalize">
                  {form.priority}
                </Badge>
              </div>

              <SheetTitle className="text-2xl">Edit ticket</SheetTitle>
              <SheetDescription>
                Update the ticket details and save the changes locally.
              </SheetDescription>
            </SheetHeader>

            <Separator className="my-6" />

            <form
              onSubmit={handleSubmit}
              className="flex flex-1 flex-col gap-5 overflow-y-auto"
            >
              <div className="space-y-2">
                <label className="text-sm font-medium">Title</label>
                <Input
                  value={form.title}
                  onChange={(e) => updateField("title", e.target.value)}
                  placeholder="Add robot state timeline"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Summary</label>
                <Textarea
                  value={form.summary}
                  onChange={(e) => updateField("summary", e.target.value)}
                  className="min-h-32"
                  placeholder="Explain what needs to be done..."
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Project</label>
                  <Select
                    value={form.projectId}
                    onValueChange={(value) => updateField("projectId", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select project" />
                    </SelectTrigger>
                    <SelectContent>
                      {projects.map((project) => (
                        <SelectItem key={project.id} value={project.id}>
                          {project.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Assignee</label>
                  <Input
                    value={form.assignee}
                    onChange={(e) => updateField("assignee", e.target.value)}
                    placeholder="Aarav"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Status</label>
                  <Select
                    value={form.status}
                    onValueChange={(value) =>
                      updateField("status", value as TicketStatus)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Priority</label>
                  <Select
                    value={form.priority}
                    onValueChange={(value) =>
                      updateField("priority", value as Priority)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      {priorityOptions.map((priority) => (
                        <SelectItem key={priority} value={priority}>
                          {priority}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium">
                  <Tag className="h-4 w-4" />
                  Labels
                </label>
                <Input
                  value={form.labels}
                  onChange={(e) => updateField("labels", e.target.value)}
                  placeholder="UI, Robotics, Debugging"
                />
                <p className="text-xs text-muted-foreground">
                  Separate labels with commas.
                </p>
              </div>

              <div className="grid gap-3 rounded-3xl border bg-muted/20 p-4 sm:grid-cols-2">
                <div className="flex items-start gap-3">
                  <FolderKanban className="mt-0.5 h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                      Project
                    </p>
                    <p className="text-sm font-medium">
                      {projectNameById.get(form.projectId) ?? "Unknown project"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <UserRound className="mt-0.5 h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                      Assignee initials
                    </p>
                    <p className="text-sm font-medium">
                      {initialsFromName(form.assignee)}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CalendarDays className="mt-0.5 h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                      Updated
                    </p>
                    <p className="text-sm font-medium">{ticket.updatedAt}</p>
                  </div>
                </div>
              </div>

              {error ? (
                <div className="rounded-2xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                  {error}
                </div>
              ) : null}

              <div className="mt-auto flex items-center justify-end gap-3 border-t pt-4">
                <Button type="button" variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button type="submit">
                  <Save className="mr-2 h-4 w-4" />
                  Save changes
                </Button>
              </div>
            </form>
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}