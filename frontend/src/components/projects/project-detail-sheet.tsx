"use client";

import {
  CalendarDays,
  CheckCircle2,
  FolderKanban,
  Pencil,
  Trash2,
  User,
} from "lucide-react";
import { useState } from "react";

import {
  deleteProject,
  type Project,
} from "@/lib/projects";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";

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
  onEdit,
  onDeleted,
}: {
  project: Project | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (project: Project) => void;
  onDeleted: () => void;
}) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    if (!project) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete "${project.name}"? This action cannot be undone.`,
    );

    if (!confirmed) return;

    try {
      setDeleting(true);
      setError(null);

      await deleteProject(project.id);

      onOpenChange(false);
      onDeleted();
    } catch {
      setError("Failed to delete project.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl">
        {project ? (
          <div className="flex h-full flex-col pt-6">
            <div className="flex-1 space-y-6 overflow-y-auto pr-2">
              <SheetHeader className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <Badge
                    variant="secondary"
                    className="w-fit rounded-full capitalize"
                  >
                    {project.status}
                  </Badge>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(project)}
                    disabled={deleting}
                  >
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                </div>

                <SheetTitle className="text-2xl">
                  {project.name}
                </SheetTitle>

                <SheetDescription>
                  {project.description}
                </SheetDescription>
              </SheetHeader>

              <Separator />

              <div className="grid grid-cols-2 gap-3">
                <MetricCard
                  icon={FolderKanban}
                  label="Project ID"
                  value={String(project.id)}
                />

                <MetricCard
                  icon={CheckCircle2}
                  label="Status"
                  value={project.status}
                />

                <MetricCard
                  icon={CalendarDays}
                  label="Deadline"
                  value={
                    project.deadline
                      ? new Date(
                          project.deadline,
                        ).toLocaleDateString()
                      : "No deadline"
                  }
                />

                <MetricCard
                  icon={User}
                  label="Created By"
                  value={String(project.created_by)}
                />
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">
                  Objective
                </p>

                <p className="text-sm text-muted-foreground">
                  {project.objective}
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">
                  Description
                </p>

                <p className="text-sm text-muted-foreground">
                  {project.description}
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">
                  Created
                </p>

                <p className="text-sm text-muted-foreground">
                  {new Date(
                    project.created_at,
                  ).toLocaleString()}
                </p>
              </div>

              {error && (
                <p className="text-sm text-destructive">
                  {error}
                </p>
              )}
            </div>

            <div className="mt-6 border-t pt-4">
              <Button
                variant="destructive"
                className="w-full"
                onClick={handleDelete}
                disabled={deleting}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {deleting
                  ? "Deleting..."
                  : "Delete project"}
              </Button>
            </div>
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}