"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

import {
  createProject,
  updateProject,
  type Project,
} from "@/lib/projects";

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

type ProjectDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
  project?: Project | null;
};

export function CreateProjectDialog({
  open,
  onOpenChange,
  onSaved,
  project = null,
}: ProjectDialogProps) {
  const isEditing = Boolean(project);

  const [name, setName] = useState("");
  const [objective, setObjective] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;

    if (project) {
      setName(project.name);
      setObjective(project.objective);
      setDescription(project.description);

      setDeadline(
        project.deadline
          ? project.deadline.slice(0, 10)
          : "",
      );
    } else {
      setName("");
      setObjective("");
      setDescription("");
      setDeadline("");
    }

    setError(null);
  }, [open, project]);

  async function handleSubmit(
    e: React.FormEvent,
  ) {
    e.preventDefault();

    if (
      !name.trim() ||
      !objective.trim() ||
      !description.trim()
    ) {
      setError(
        "Name, objective, and description are required.",
      );
      return;
    }

    try {
      setLoading(true);
      setError(null);

      if (project) {
        await updateProject(project.id, {
          name: name.trim(),
          objective: objective.trim(),
          description: description.trim(),
          deadline: deadline || null,
        });
      } else {
        await createProject({
          name: name.trim(),
          objective: objective.trim(),
          description: description.trim(),
          deadline: deadline || null,
        });
      }

      onOpenChange(false);
      onSaved();
    } catch {
      setError(
        isEditing
          ? "Failed to update project."
          : "Failed to create project.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {isEditing
                ? "Edit project"
                : "New project"}
            </DialogTitle>

            <DialogDescription>
              {isEditing
                ? "Update the project details."
                : "Create a project for your workspace."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-6">
            <div className="space-y-2">
              <label
                htmlFor="project-name"
                className="text-sm font-medium"
              >
                Name
              </label>

              <Input
                id="project-name"
                value={name}
                onChange={(e) =>
                  setName(e.target.value)
                }
                placeholder="Project name"
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="project-objective"
                className="text-sm font-medium"
              >
                Objective
              </label>

              <Input
                id="project-objective"
                value={objective}
                onChange={(e) =>
                  setObjective(e.target.value)
                }
                placeholder="What is this project trying to achieve?"
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="project-description"
                className="text-sm font-medium"
              >
                Description
              </label>

              <Textarea
                id="project-description"
                value={description}
                onChange={(e) =>
                  setDescription(e.target.value)
                }
                placeholder="Describe the project..."
                rows={4}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="project-deadline"
                className="text-sm font-medium"
              >
                Deadline
              </label>

              <Input
                id="project-deadline"
                type="date"
                value={deadline}
                onChange={(e) =>
                  setDeadline(e.target.value)
                }
                disabled={loading}
              />
            </div>

            {error && (
              <p className="text-sm text-destructive">
                {error}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                onOpenChange(false)
              }
              disabled={loading}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={loading}
            >
              {loading && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}

              {isEditing
                ? "Save changes"
                : "Create project"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}