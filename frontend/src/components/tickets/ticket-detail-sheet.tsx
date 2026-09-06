"use client";

import * as React from "react";

import {
  CalendarDays,
  FolderKanban,
  Save,
  Tag,
  Trash2,
  UserRound,
} from "lucide-react";

import type {
  Priority,
  Ticket,
  TicketStatus,
} from "@/lib/types";

import { can } from "@/lib/rbac";
import { useAuthStore } from "@/store/auth-store";

import { deleteTicket } from "@/lib/tickets";

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
  id: number;
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

const priorityOptions: Priority[] = [
  "low",
  "medium",
  "high",
  "urgent",
];

function initialsFromName(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function buildFormState(
  ticket: Ticket,
): TicketFormState {
  return {
    title: ticket.title,
    summary: ticket.summary,
    status: ticket.status,
    priority: ticket.priority,
    projectId: String(ticket.project_id),
    assignee: ticket.assignee?.name ?? "",
    labels: ticket.labels.join(", "),
  };
}

export function TicketDetailSheet({
  ticket,
  projects,
  open,
  onOpenChange,
  onSave,
  onDelete,
}: {
  ticket: Ticket | null;
  projects: ProjectOption[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (ticket: Ticket) => void;
  onDelete: (ticketId: number) => void;
}) {
  const user = useAuthStore(
    (state) => state.user,
  );

  const canEditTicket = can(
    user,
    "ticket:edit",
    ticket ?? undefined,
  );

  const canDeleteTicket = can(
    user,
    "ticket:delete",
    ticket ?? undefined,
  );

  const [form, setForm] =
    React.useState<TicketFormState | null>(() =>
      ticket ? buildFormState(ticket) : null,
    );

  const [error, setError] =
    React.useState<string | null>(null);

  const [deleting, setDeleting] =
    React.useState(false);

  const projectNameById = React.useMemo(() => {
    return new Map(
      projects.map((project) => [
        project.id,
        project.name,
      ]),
    );
  }, [projects]);

  React.useEffect(() => {
    setForm(
      ticket ? buildFormState(ticket) : null,
    );
    setError(null);
  }, [ticket]);

  function handleClose() {
    if (deleting) return;

    onOpenChange(false);
    setError(null);
  }

  function updateField<K extends keyof TicketFormState>(
    key: K,
    value: TicketFormState[K],
  ) {
    setForm((current) => {
      if (!current) return current;

      return {
        ...current,
        [key]: value,
      };
    });
  }

  function handleSubmit(
    e: React.FormEvent<HTMLFormElement>,
  ) {
    e.preventDefault();

    if (!canEditTicket) {
      setError(
        "You do not have permission to edit this ticket.",
      );
      return;
    }

    if (!ticket || !form) return;

    const title = form.title.trim();
    const summary = form.summary.trim();

    if (!title || !summary || !form.projectId) {
      setError(
        "Please fill in the title, summary, and project.",
      );
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
      project_id: Number(form.projectId),
      assignee: form.assignee
        ? {
            id: ticket.assignee?.id ?? 0,
            name: form.assignee,
            initials: initialsFromName(
              form.assignee,
            ),
          }
        : null,
    });

    handleClose();
  }

  async function handleDelete() {
    if (!ticket || !canDeleteTicket || deleting) {
      return;
    }

    const confirmed = window.confirm(
      `Delete ${ticket.key}? This action cannot be undone.`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeleting(true);
      setError(null);

      await deleteTicket(ticket.id);

      onDelete(ticket.id);
      onOpenChange(false);
    } catch {
      setError("Failed to delete ticket.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <Sheet
      open={open}
      onOpenChange={(nextOpen) => {
        if (deleting) return;
        onOpenChange(nextOpen);
      }}
    >
      <SheetContent className="w-full sm:max-w-2xl">
        {ticket && form ? (
          <div className="flex h-full flex-col pt-6">
            <SheetHeader className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className="rounded-full"
                >
                  {ticket.key}
                </Badge>

                <Badge
                  variant="secondary"
                  className="rounded-full capitalize"
                >
                  {form.status}
                </Badge>

                <Badge
                  variant="secondary"
                  className="rounded-full capitalize"
                >
                  {form.priority}
                </Badge>
              </div>

              <SheetTitle className="text-2xl">
                {canEditTicket
                  ? "Edit ticket"
                  : "Ticket details"}
              </SheetTitle>

              <SheetDescription>
                {canEditTicket
                  ? "Update the ticket details and save the changes."
                  : "You have view-only access to this ticket."}
              </SheetDescription>
            </SheetHeader>

            <Separator className="my-6" />

            <form
              onSubmit={handleSubmit}
              className="flex flex-1 flex-col gap-5 overflow-y-auto"
            >
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Title
                </label>

                <Input
                  value={form.title}
                  onChange={(e) =>
                    updateField(
                      "title",
                      e.target.value,
                    )
                  }
                  placeholder="Add robot state timeline"
                  disabled={!canEditTicket || deleting}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Summary
                </label>

                <Textarea
                  value={form.summary}
                  onChange={(e) =>
                    updateField(
                      "summary",
                      e.target.value,
                    )
                  }
                  className="min-h-32"
                  placeholder="Explain what needs to be done..."
                  disabled={!canEditTicket || deleting}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Project
                  </label>

                  <Select
                    value={form.projectId}
                    onValueChange={(value) =>
                      updateField(
                        "projectId",
                        value ?? "",
                      )
                    }
                    disabled={!canEditTicket || deleting}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select project" />
                    </SelectTrigger>

                    <SelectContent>
                      {projects.map((project) => (
                        <SelectItem
                          key={project.id}
                          value={String(project.id)}
                        >
                          {project.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Assignee
                  </label>

                  <Input
                    value={form.assignee}
                    onChange={(e) =>
                      updateField(
                        "assignee",
                        e.target.value,
                      )
                    }
                    placeholder="Aarav"
                    disabled={!canEditTicket || deleting}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Status
                  </label>

                  <Select
                    value={form.status}
                    onValueChange={(value) =>
                      updateField(
                        "status",
                        value as TicketStatus,
                      )
                    }
                    disabled={!canEditTicket || deleting}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>

                    <SelectContent>
                      {statusOptions.map(
                        (status) => (
                          <SelectItem
                            key={status}
                            value={status}
                          >
                            {status}
                          </SelectItem>
                        ),
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Priority
                  </label>

                  <Select
                    value={form.priority}
                    onValueChange={(value) =>
                      updateField(
                        "priority",
                        value as Priority,
                      )
                    }
                    disabled={!canEditTicket || deleting}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>

                    <SelectContent>
                      {priorityOptions.map(
                        (priority) => (
                          <SelectItem
                            key={priority}
                            value={priority}
                          >
                            {priority}
                          </SelectItem>
                        ),
                      )}
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
                  onChange={(e) =>
                    updateField(
                      "labels",
                      e.target.value,
                    )
                  }
                  placeholder="UI, Robotics, Debugging"
                  disabled={!canEditTicket || deleting}
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
                      {projectNameById.get(
                        Number(form.projectId),
                      ) ?? "Unknown project"}
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
                      {initialsFromName(
                        form.assignee,
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CalendarDays className="mt-0.5 h-4 w-4 text-muted-foreground" />

                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                      Updated
                    </p>

                    <p className="text-sm font-medium">
                      {ticket.updated_at}
                    </p>
                  </div>
                </div>
              </div>

              {error ? (
                <div className="rounded-2xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                  {error}
                </div>
              ) : null}

              <div className="mt-auto flex items-center justify-between gap-3 border-t pt-4">
                {canDeleteTicket ? (
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={handleDelete}
                    disabled={deleting}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    {deleting
                      ? "Deleting..."
                      : "Delete"}
                  </Button>
                ) : (
                  <div />
                )}

                <div className="flex items-center gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleClose}
                    disabled={deleting}
                  >
                    Close
                  </Button>

                  {canEditTicket && (
                    <Button
                      type="submit"
                      disabled={deleting}
                    >
                      <Save className="mr-2 h-4 w-4" />
                      Save changes
                    </Button>
                  )}
                </div>
              </div>
            </form>
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}