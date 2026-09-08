"use client";

import * as React from "react";
import {
  CalendarDays,
  FolderKanban,
  Save,
  Tag,
  UserRound,
  X,
} from "lucide-react";

import type {
  Priority,
  Ticket,
  TicketStatus,
} from "@/lib/types";
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
  assigneeId: string;
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

function getStatusLabel(status: TicketStatus) {
  switch (status) {
    case "backlog":
      return "Backlog";
    case "todo":
      return "To Do";
    case "in-progress":
      return "In Progress";
    case "review":
      return "Review";
    case "done":
      return "Done";
    default:
      return status;
  }
}

function getPriorityLabel(priority: Priority) {
  return priority.charAt(0).toUpperCase() + priority.slice(1);
}

function getStatusStyles(status: TicketStatus) {
  switch (status) {
    case "done":
      return {
        className:
          "border-[#CBFF3D]/25 bg-[#CBFF3D]/10 text-[#CBFF3D]",
        dot: "bg-[#CBFF3D]",
      };

    case "in-progress":
      return {
        className:
          "border-blue-400/25 bg-blue-400/10 text-blue-300",
        dot: "bg-blue-400",
      };

    case "review":
      return {
        className:
          "border-purple-400/25 bg-purple-400/10 text-purple-300",
        dot: "bg-purple-400",
      };

    case "todo":
      return {
        className:
          "border-yellow-400/25 bg-yellow-400/10 text-yellow-300",
        dot: "bg-yellow-400",
      };

    case "backlog":
    default:
      return {
        className:
          "border-white/10 bg-white/[0.05] text-[#A0A0A0]",
        dot: "bg-[#777]",
      };
  }
}

function getPriorityStyles(priority: Priority) {
  switch (priority) {
    case "urgent":
      return "border-red-400/25 bg-red-400/10 text-red-300";

    case "high":
      return "border-orange-400/25 bg-orange-400/10 text-orange-300";

    case "medium":
      return "border-yellow-400/25 bg-yellow-400/10 text-yellow-300";

    case "low":
    default:
      return "border-white/10 bg-white/[0.05] text-[#A0A0A0]";
  }
}

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
    projectId: String(ticket.project_id),
    assigneeId: ticket.assignee
      ? String(ticket.assignee.id)
      : "",
    labels: ticket.labels.join(", "),
  };
}

export function TicketDetailSheet({
  ticket,
  projects,
  users,
  open,
  onOpenChange,
  onSave,
  onDelete,
}: {
  ticket: Ticket | null;
  projects: ProjectOption[];
  users?: Array<{
    id: number;
    full_name: string;
    role?: string;
    department?: string;
  }>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (ticket: Ticket) => void;
  onDelete?: (ticketId: number) => void;
}) {
  const [form, setForm] =
    React.useState<TicketFormState | null>(() =>
      ticket ? buildFormState(ticket) : null,
    );

  const [error, setError] =
    React.useState<string | null>(null);

  React.useEffect(() => {
    if (ticket) {
      setForm(buildFormState(ticket));
      setError(null);
    }
  }, [ticket]);

  React.useEffect(() => {
    if (!open) {
      setError(null);
    }
  }, [open]);

  const projectNameById = React.useMemo(() => {
    return new Map(
      projects.map((project) => [
        project.id,
        project.name,
      ]),
    );
  }, [projects]);

  const userNameById = React.useMemo(() => {
    return new Map(
      (users ?? []).map((user) => [
        user.id,
        user.full_name,
      ]),
    );
  }, [users]);

  function handleClose() {
    onOpenChange(false);
    setError(null);
  }

  function updateField<K extends keyof TicketFormState>(
    key: K,
    value: TicketFormState[K],
  ) {
    setForm((current) => {
      if (!current) {
        return current;
      }

      return {
        ...current,
        [key]: value,
      };
    });
  }

  function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!ticket || !form) {
      return;
    }

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

    const assigneeId = form.assigneeId
      ? Number(form.assigneeId)
      : null;

    const existingAssignee =
      assigneeId !== null
        ? ticket.assignee?.id === assigneeId
          ? ticket.assignee
          : {
              id: assigneeId,
              name:
                userNameById.get(assigneeId) ??
                "Unknown user",
              initials: initialsFromName(
                userNameById.get(assigneeId) ??
                  "Unknown user",
              ),
            }
        : null;

    onSave({
      ...ticket,
      title,
      summary,
      status: form.status,
      priority: form.priority,
      labels,
      project_id: Number(form.projectId),
      assignee: existingAssignee,
    });

    handleClose();
  }

  if (!ticket || !form || !open) {
    return null;
  }

  const statusStyles = getStatusStyles(form.status);
  const priorityStyles = getPriorityStyles(
    form.priority,
  );

  const selectedProjectName =
    projectNameById.get(Number(form.projectId)) ??
    "Unknown project";

  const selectedAssigneeName = form.assigneeId
    ? userNameById.get(Number(form.assigneeId)) ??
      ticket.assignee?.name ??
      "Unknown user"
    : "Unassigned";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="ticket-detail-title"
    >
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close ticket details"
        className="absolute inset-0 cursor-default bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={() => onOpenChange(false)}
      />

      {/* Modal */}
      <div
        className="
          relative z-10
          flex max-h-[92vh] w-full max-w-3xl flex-col
          overflow-hidden
          rounded-3xl
          border border-[#292929]
          bg-[#0d0d0d]
          shadow-2xl shadow-black/50
          animate-in fade-in zoom-in-95 duration-200
        "
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-6 px-6 pb-5 pt-6 sm:px-8 sm:pt-7">
          <div className="min-w-0 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant="outline"
                className="rounded-full border-white/10 bg-white/[0.03] px-3 py-1 font-mono text-xs text-[#BDBDBD]"
              >
                {ticket.key}
              </Badge>

              <Badge
                variant="outline"
                className={`rounded-full px-3 py-1 ${statusStyles.className}`}
              >
                <span
                  className={`mr-1.5 h-1.5 w-1.5 rounded-full ${statusStyles.dot}`}
                />
                {getStatusLabel(form.status)}
              </Badge>

              <Badge
                variant="outline"
                className={`rounded-full px-3 py-1 ${priorityStyles}`}
              >
                {getPriorityLabel(form.priority)}
              </Badge>
            </div>

            <div>
              <h2
                id="ticket-detail-title"
                className="text-2xl font-semibold tracking-tight text-white sm:text-3xl"
              >
                {ticket.title}
              </h2>

              <p className="mt-1 text-sm text-[#777]">
                Ticket details and configuration
              </p>
            </div>
          </div>

          <button
            type="button"
            aria-label="Close"
            onClick={handleClose}
            className="
              flex h-9 w-9 shrink-0 items-center justify-center
              rounded-full border border-white/10
              text-[#777]
              transition-colors
              hover:border-white/20
              hover:bg-white/[0.06]
              hover:text-white
            "
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <Separator className="bg-[#202020]" />

        {/* Content */}
        <form
          onSubmit={handleSubmit}
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="overflow-y-auto px-6 py-6 sm:px-8">
            <div className="grid gap-6">
              {/* Summary */}
              <div className="rounded-2xl border border-[#242424] bg-[#121212] p-5">
                <div className="mb-4 flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.05]">
                    <Tag className="h-4 w-4 text-[#CBFF3D]" />
                  </div>

                  <div>
                    <p className="text-sm font-medium text-white">
                      Ticket information
                    </p>
                    <p className="text-xs text-[#666]">
                      Core ticket details
                    </p>
                  </div>
                </div>

                <div className="space-y-5">
                  <div className="space-y-2">
                    <label
                      htmlFor="ticket-title"
                      className="text-xs font-medium uppercase tracking-[0.12em] text-[#777]"
                    >
                      Title
                    </label>

                    <Input
                      id="ticket-title"
                      value={form.title}
                      onChange={(event) =>
                        updateField(
                          "title",
                          event.target.value,
                        )
                      }
                      placeholder="Ticket title"
                      className="
                        border-[#292929]
                        bg-[#0d0d0d]
                        text-white
                        placeholder:text-[#555]
                        focus-visible:ring-[#CBFF3D]/30
                      "
                    />
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="ticket-summary"
                      className="text-xs font-medium uppercase tracking-[0.12em] text-[#777]"
                    >
                      Summary
                    </label>

                    <Textarea
                      id="ticket-summary"
                      value={form.summary}
                      onChange={(event) =>
                        updateField(
                          "summary",
                          event.target.value,
                        )
                      }
                      placeholder="Describe the ticket..."
                      rows={5}
                      className="
                        resize-none
                        border-[#292929]
                        bg-[#0d0d0d]
                        text-white
                        placeholder:text-[#555]
                        focus-visible:ring-[#CBFF3D]/30
                      "
                    />
                  </div>
                </div>
              </div>

              {/* Metadata */}
              <div className="grid gap-4 sm:grid-cols-2">
                {/* Status */}
                <div className="rounded-2xl border border-[#242424] bg-[#121212] p-5">
                  <div className="mb-3 flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-[#CBFF3D]" />
                    <span className="text-xs font-medium uppercase tracking-[0.12em] text-[#777]">
                      Status
                    </span>
                  </div>

                  <Select
                    value={form.status}
                    onValueChange={(value) =>
                      updateField(
                        "status",
                        value as TicketStatus,
                      )
                    }
                  >
                    <SelectTrigger className="border-[#292929] bg-[#0d0d0d] text-white">
                      <SelectValue />
                    </SelectTrigger>

                    <SelectContent>
                      {statusOptions.map((status) => (
                        <SelectItem
                          key={status}
                          value={status}
                        >
                          {getStatusLabel(status)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Priority */}
                <div className="rounded-2xl border border-[#242424] bg-[#121212] p-5">
                  <div className="mb-3 flex items-center gap-2">
                    <span className="text-sm font-semibold text-[#CBFF3D]">
                      !
                    </span>
                    <span className="text-xs font-medium uppercase tracking-[0.12em] text-[#777]">
                      Priority
                    </span>
                  </div>

                  <Select
                    value={form.priority}
                    onValueChange={(value) =>
                      updateField(
                        "priority",
                        value as Priority,
                      )
                    }
                  >
                    <SelectTrigger className="border-[#292929] bg-[#0d0d0d] text-white">
                      <SelectValue />
                    </SelectTrigger>

                    <SelectContent>
                      {priorityOptions.map(
                        (priority) => (
                          <SelectItem
                            key={priority}
                            value={priority}
                          >
                            {getPriorityLabel(priority)}
                          </SelectItem>
                        ),
                      )}
                    </SelectContent>
                  </Select>
                </div>

                {/* Project */}
                <div className="rounded-2xl border border-[#242424] bg-[#121212] p-5">
                  <div className="mb-3 flex items-center gap-2">
                    <FolderKanban className="h-4 w-4 text-[#CBFF3D]" />
                    <span className="text-xs font-medium uppercase tracking-[0.12em] text-[#777]">
                      Project
                    </span>
                  </div>

                  <Select
                    value={form.projectId}
                    onValueChange={(value) =>
                      updateField(
                        "projectId",
                        value ?? "",
                      )
                    }
                  >
                    <SelectTrigger className="border-[#292929] bg-[#0d0d0d] text-white">
                      <SelectValue>
                        {selectedProjectName}
                      </SelectValue>
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

                {/* Assignee */}
                <div className="rounded-2xl border border-[#242424] bg-[#121212] p-5">
                  <div className="mb-3 flex items-center gap-2">
                    <UserRound className="h-4 w-4 text-[#CBFF3D]" />
                    <span className="text-xs font-medium uppercase tracking-[0.12em] text-[#777]">
                      Assignee
                    </span>
                  </div>

                  <Select
                    value={
                      form.assigneeId || "unassigned"
                    }
                    onValueChange={(value) =>
                      updateField(
                        "assigneeId",
                        value === null ||
                          value === "unassigned"
                          ? ""
                          : value,
                      )
                    }
                  >
                    <SelectTrigger className="border-[#292929] bg-[#0d0d0d] text-white">
                      <SelectValue>
                        {selectedAssigneeName}
                      </SelectValue>
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="unassigned">
                        Unassigned
                      </SelectItem>

                      {(users ?? []).map((user) => (
                        <SelectItem
                          key={user.id}
                          value={String(user.id)}
                        >
                          {user.full_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Labels */}
              <div className="rounded-2xl border border-[#242424] bg-[#121212] p-5">
                <div className="mb-3 flex items-center gap-2">
                  <Tag className="h-4 w-4 text-[#CBFF3D]" />
                  <span className="text-xs font-medium uppercase tracking-[0.12em] text-[#777]">
                    Labels
                  </span>
                </div>

                <Input
                  value={form.labels}
                  onChange={(event) =>
                    updateField(
                      "labels",
                      event.target.value,
                    )
                  }
                  placeholder="hardware, navigation, bug"
                  className="
                    border-[#292929]
                    bg-[#0d0d0d]
                    text-white
                    placeholder:text-[#555]
                    focus-visible:ring-[#CBFF3D]/30
                  "
                />

                <p className="mt-2 text-xs text-[#555]">
                  Separate multiple labels with commas.
                </p>
              </div>

              {/* Existing ticket metadata */}
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-[#242424] bg-[#121212] p-4">
                  <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-[#666]">
                    Ticket ID
                  </p>
                  <p className="mt-2 font-mono text-sm text-white">
                    #{ticket.id}
                  </p>
                </div>

                <div className="rounded-2xl border border-[#242424] bg-[#121212] p-4">
                  <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-[#666]">
                    Created By
                  </p>
                  <p className="mt-2 text-sm text-white">
                    User #{ticket.created_by}
                  </p>
                </div>

                <div className="rounded-2xl border border-[#242424] bg-[#121212] p-4">
                  <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-[#666]">
                    Updated
                  </p>
                  <p className="mt-2 text-sm text-white">
                    {new Date(
                      ticket.updated_at,
                    ).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {error && (
                <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                  {error}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-[#202020] bg-[#0b0b0b] px-6 py-4 sm:px-8">
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-[#555]">
                Changes are saved to the Leela backend.
              </p>

              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleClose}
                  className="text-[#999] hover:bg-white/[0.05] hover:text-white"
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  className="
                    gap-2
                    bg-[#CBFF3D]
                    text-black
                    hover:bg-[#CBFF3D]/90
                  "
                >
                  <Save className="h-4 w-4" />
                  Save changes
                </Button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}