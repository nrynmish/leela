"use client";

import * as React from "react";
import { Plus } from "lucide-react";

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
import type { Priority, TicketDraft, TicketStatus } from "@/lib/types";

type ProjectOption = {
  id: string;
  name: string;
};

type CreateTicketForm = {
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

const assigneeOptions = ["Aarav", "Meera", "Kabir", "Isha", "Rohan", "Dev"];

type CreateTicketDialogProps = {
  projects: ProjectOption[];
  onCreate: (ticket: TicketDraft) => void;
};

function buildInitialState(
  projects: ProjectOption[]
): CreateTicketForm {
  return {
    title: "",
    summary: "",
    status: "todo",
    priority: "medium",
    projectId: projects[0]?.id ?? "",
    assignee: assigneeOptions[0] ?? "",
    labels: "",
  };
}

export function CreateTicketDialog({
  projects,
  onCreate,
}: CreateTicketDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [form, setForm] = React.useState<CreateTicketForm>(() =>
    buildInitialState(projects)
  );
  const [error, setError] = React.useState<string | null>(null);

  function resetForm() {
    setForm(buildInitialState(projects));
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

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const title = form.title.trim();
    const summary = form.summary.trim();

    if (!title || !summary || !form.projectId) {
      setError("Please fill in the title, summary, and project.");
      return;
    }

    onCreate({
      title,
      summary,
      status: form.status,
      priority: form.priority,
      projectId: form.projectId,
      assignee: form.assignee,
      labels: form.labels
        .split(",")
        .map((label) => label.trim())
        .filter(Boolean),
    });

    handleOpenChange(false);
  }

  return (
    <>
      <Button className="rounded-full" onClick={handleCreateClick}>
        <Plus className="mr-2 h-4 w-4" />
        New Ticket
      </Button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create ticket</DialogTitle>
            <DialogDescription>
              Add a new issue to the workspace. This is local-only for now.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium">Title</label>
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
              <label className="text-sm font-medium">Summary</label>
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
                <label className="text-sm font-medium">Project</label>
                <Select
                  value={form.projectId}
                  onValueChange={(value) =>
                    setForm((current) => ({
                      ...current,
                      projectId: value,
                    }))
                  }
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
                <Select
                  value={form.assignee}
                  onValueChange={(value) =>
                    setForm((current) => ({
                      ...current,
                      assignee: value,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select assignee" />
                  </SelectTrigger>
                  <SelectContent>
                    {assigneeOptions.map((name) => (
                      <SelectItem key={name} value={name}>
                        {name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select
                  value={form.status}
                  onValueChange={(value) =>
                    setForm((current) => ({
                      ...current,
                      status: value as TicketStatus,
                    }))
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
                    setForm((current) => ({
                      ...current,
                      priority: value as Priority,
                    }))
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
              <label className="text-sm font-medium">Labels</label>
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
                onClick={() => handleOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Create Ticket</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}