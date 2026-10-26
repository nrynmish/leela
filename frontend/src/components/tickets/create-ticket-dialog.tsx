"use client";

import * as React from "react";
import { Plus } from "lucide-react";

import type { User } from "@/types/auth";
import { canAssign } from "@/lib/rbac";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import type {
  Priority,
  TicketDraft,
  TicketStatus,
} from "@/lib/types";

type ProjectOption = {
  id: number;
  name: string;
};

type CreateTicketForm = {
  title: string;
  summary: string;
  status: TicketStatus;
  priority: Priority;
  project_id: number | "";
  assignee_id: number | null;
  assignee_ids: number[];
  assignment_mode: "individual" | "common";
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

function buildInitialState(
  projects: ProjectOption[],
  projectId?: number,
): CreateTicketForm {
  return {
    title: "",
    summary: "",
    status: "todo",
    priority: "medium",
    project_id:
      projectId ??
      projects[0]?.id ??
      "",
    assignee_id: null,
    assignee_ids: [],
    assignment_mode: "individual",
    labels: "",
  };
}

export function CreateTicketDialog({
  projects,
  users,
  currentUser,
  onCreate,
  projectId,
  projectName,
  triggerLabel = "New Ticket",
}: {
  projects: ProjectOption[];
  users: User[];
  currentUser: User | null;
  onCreate: (ticket: TicketDraft) => void | Promise<void>;
  projectId?: number;
  projectName?: string;
  triggerLabel?: string;
}) {
  const [open, setOpen] = React.useState(false);

  const [form, setForm] =
    React.useState<CreateTicketForm>(() =>
      buildInitialState(projects, projectId),
    );

  const [error, setError] =
    React.useState<string | null>(null);
  const [searchTerm, setSearchTerm] =
    React.useState("");

  const assignableUsers = currentUser
    ? users.filter((u) => canAssign(currentUser, u))
    : [];

  const selectedAssignees = assignableUsers.filter(
    (user) => form.assignee_ids.includes(user.id),
  );

  const filteredUsers = assignableUsers.filter(
    (user) =>
      !form.assignee_ids.includes(user.id) &&
      user.full_name
        .toLowerCase()
        .includes(searchTerm.toLowerCase()),
  );

  const expectedTicketCount =
    form.assignee_ids.length === 0
      ? 1
      : form.assignment_mode === "individual"
        ? form.assignee_ids.length
        : 1;

  function resetForm() {
    setForm(
      buildInitialState(
        projects,
        projectId,
      ),
    );

    setError(null);
  }

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);

    if (!nextOpen) {
      resetForm();
    }
  }

  function handleCreateClick() {
    resetForm();
    setOpen(true);
  }

  function toggleAssignee(userId: number) {
    setForm((current) => {
      const selected = current.assignee_ids.includes(userId);
      const assigneeIds = selected
        ? current.assignee_ids.filter((id) => id !== userId)
        : [...current.assignee_ids, userId];

      return {
        ...current,
        assignee_ids: assigneeIds,
        assignee_id:
          assigneeIds.length > 0
            ? assigneeIds[0]
            : null,
      };
    });
  }

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>,
  ) {
    e.preventDefault();

    const title = form.title.trim();
    const summary = form.summary.trim();

    if (
      !title ||
      !summary ||
      form.project_id === ""
    ) {
      setError(
        "Please fill in the title, summary, and project.",
      );
      return;
    }

    try {
      setError(null);

      await onCreate({
        title,
        summary,
        status: form.status,
        priority: form.priority,
        project_id: form.project_id,
        assignee_id:
          form.assignee_ids[0] ?? null,
        assignee_ids: form.assignee_ids,
        assignment_mode: form.assignment_mode,
        labels: form.labels
          .split(",")
          .map((label) => label.trim())
          .filter(Boolean),
      });

      setOpen(false);
      resetForm();
    } catch {
      setError("Failed to create ticket.");
    }
  }

  return (
    <>
      <Button
        className="rounded-full"
        onClick={handleCreateClick}
      >
        <Plus className="mr-2 h-4 w-4" />
        {triggerLabel}
      </Button>

      <Dialog
        open={open}
        onOpenChange={handleOpenChange}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Create ticket
            </DialogTitle>

            <DialogDescription>
              {projectName
                ? `Create a ticket for ${projectName}.`
                : "Add a new issue to the workspace."}
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Title
              </label>

              <Input
                value={form.title}
                onChange={(e) =>
                  setForm((current) => ({
                    ...current,
                    title: e.target.value,
                  }))
                }
                placeholder="Add robot state timeline"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Summary
              </label>

              <Textarea
                value={form.summary}
                onChange={(e) =>
                  setForm((current) => ({
                    ...current,
                    summary: e.target.value,
                  }))
                }
                placeholder="Explain what needs to be done..."
                className="min-h-28"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Project
                </label>

                {projectId ? (
                  <div className="flex h-10 items-center rounded-md border border-[#262626] bg-[#141414] px-3 text-sm text-white">
                    {projectName ??
                      projects.find(
                        (project) =>
                          project.id === projectId,
                      )?.name ??
                      `Project #${projectId}`}
                  </div>
                ) : (
                  <Select
                    value={
                      form.project_id === ""
                        ? undefined
                        : String(form.project_id)
                    }
                    onValueChange={(value) =>
                      setForm((current) => ({
                        ...current,
                        project_id: Number(value),
                      }))
                    }
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
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Assignees
                </label>

                <div className="space-y-3 rounded-[14px] border border-[#262626] bg-[#141414] p-3">
                  <Input
                    value={searchTerm}
                    onChange={(event) =>
                      setSearchTerm(event.target.value)
                    }
                    placeholder="Search members"
                  />

                  <div className="flex flex-wrap gap-2">
                    {selectedAssignees.length === 0 ? (
                      <span className="text-xs text-[#A0A0A0]">
                        No assignees selected
                      </span>
                    ) : (
                      selectedAssignees.map((user) => (
                        <button
                          key={user.id}
                          type="button"
                          onClick={() =>
                            toggleAssignee(user.id)
                          }
                          className="inline-flex items-center gap-2 rounded-full border border-[var(--accent-color)]/40 bg-[color-mix(in_srgb,var(--accent-color)_10%,transparent)] px-2.5 py-1 text-xs text-white"
                        >
                          {user.full_name}
                          <span aria-hidden="true">×</span>
                        </button>
                      ))
                    )}
                  </div>

                  <div className="max-h-40 space-y-1 overflow-y-auto rounded-xl border border-[#262626] bg-[#0D0D0D] p-2">
                    {filteredUsers.length === 0 ? (
                      <p className="px-2 py-1 text-xs text-[#A0A0A0]">
                        No matching members found.
                      </p>
                    ) : (
                      filteredUsers.map((user) => (
                        <button
                          key={user.id}
                          type="button"
                          onClick={() =>
                            toggleAssignee(user.id)
                          }
                          className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left text-sm text-white hover:bg-[#1A1A1A]"
                        >
                          <span>{user.full_name}</span>
                          <span className="text-xs text-[#A0A0A0]">
                            {user.department}
                          </span>
                        </button>
                      ))
                    )}
                  </div>
                </div>

                <p className="text-xs text-[#A0A0A0]">
                  {form.assignee_ids.length === 0
                    ? "No assignee selected — the ticket will be created unassigned."
                    : `${form.assignee_ids.length} assignee${form.assignee_ids.length === 1 ? "" : "s"} selected — ${expectedTicketCount} ticket${expectedTicketCount === 1 ? "" : "s"} will be created.`}
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Assignment mode
                </label>

                <Select
                  value={form.assignment_mode}
                  onValueChange={(value) =>
                    setForm((current) => ({
                      ...current,
                      assignment_mode:
                        value === "common"
                          ? "common"
                          : "individual",
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="individual">
                      Individual tickets
                    </SelectItem>
                    <SelectItem value="common">
                      Common ticket
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Status
                </label>

                <Select
                  value={form.status}
                  onValueChange={(value) =>
                    setForm((current) => ({
                      ...current,
                      status:
                        value as TicketStatus,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>

                  <SelectContent>
                    {statusOptions.map((status) => (
                      <SelectItem
                        key={status}
                        value={status}
                      >
                        {status}
                      </SelectItem>
                    ))}
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
                    setForm((current) => ({
                      ...current,
                      priority:
                        value as Priority,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
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
              <label className="text-sm font-medium">
                Labels
              </label>

              <Input
                value={form.labels}
                onChange={(e) =>
                  setForm((current) => ({
                    ...current,
                    labels: e.target.value,
                  }))
                }
                placeholder="UI, Robotics, Debugging"
              />

              <p className="text-xs text-muted-foreground">
                Separate labels with commas.
              </p>
            </div>

            {error ? (
              <div className="rounded-2xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            ) : null}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  handleOpenChange(false)
                }
              >
                Cancel
              </Button>

              <Button type="submit">
                Create Ticket
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}