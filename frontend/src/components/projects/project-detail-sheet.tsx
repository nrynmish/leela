"use client";

import {
  CalendarDays,
  Check,
  CheckCircle2,
  CircleDot,
  FolderKanban,
  Pencil,
  Trash2,
  User,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import {
  deleteProject,
  updateProject,
  type Project,
  type ProjectStatus,
} from "@/lib/projects";

import {
  createTicket,
  getTickets,
  type Ticket,
} from "@/lib/tickets";

import { getUsers } from "@/lib/users";
import type { User as AuthUser } from "@/types/auth";

import type { TicketDraft } from "@/lib/types";

import { can } from "@/lib/rbac";
import { useAuthStore } from "@/store/auth-store";

import { CreateTicketDialog } from "@/components/tickets/create-ticket-dialog";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
    <div className="rounded-2xl border border-[#262626] bg-[#141414] p-4 transition-colors hover:border-[#333]">
      <div className="mb-2 flex items-center gap-2 text-[#777]">
        <Icon className="h-4 w-4 text-[var(--accent-color)]" />

        <span className="text-xs font-medium uppercase tracking-[0.12em]">
          {label}
        </span>
      </div>

      <p className="truncate text-sm font-semibold text-white">
        {value}
      </p>
    </div>
  );
}

function getStatusStyles(
  status: Project["status"],
) {
  switch (status) {
    case "active":
      return {
        label: "Active",
        className:
          "border-[color-mix(in_srgb,var(--accent-color)_20%,transparent)] bg-[color-mix(in_srgb,var(--accent-color)_10%,transparent)] text-[var(--accent-color)]",
        dot: "bg-[var(--accent-color)]",
      };

    case "paused":
      return {
        label: "Paused",
        className:
          "border-white/10 bg-white/[0.05] text-[#A0A0A0]",
        dot: "bg-[#888]",
      };

    case "done":
      return {
        label: "Done",
        className:
          "border-white/10 bg-white/[0.05] text-[#AAA]",
        dot: "bg-[#AAA]",
      };
  }
}

function getStatusLabel(
  status: ProjectStatus,
) {
  switch (status) {
    case "active":
      return "Active";

    case "paused":
      return "Paused";

    case "done":
      return "Done";
  }
}

function getTicketStatusLabel(
  status: Ticket["status"],
) {
  switch (status) {
    case "in-progress":
      return "In Progress";

    case "backlog":
      return "Backlog";

    case "todo":
      return "To Do";

    case "review":
      return "Review";

    case "done":
      return "Done";

    default:
      return status;
  }
}

function getPriorityClass(
  priority: Ticket["priority"],
) {
  switch (priority) {
    case "urgent":
      return "text-red-400";

    case "high":
      return "text-orange-400";

    case "medium":
      return "text-yellow-400";

    case "low":
      return "text-[#999]";

    default:
      return "text-[#999]";
  }
}

export function ProjectDetailSheet({
  project,
  open,
  onOpenChange,
  onEdit,
  onDeleted,
  onProjectUpdated,
}: {
  project: Project | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (project: Project) => void;
  onDeleted: () => void;
  onProjectUpdated: (project: Project) => void;
}) {
  const user = useAuthStore(
    (state) => state.user,
  );

  const canEditProject = can(
    user,
    "project:edit",
  );

  const canDeleteProject = can(
    user,
    "project:delete",
  );

  const canCreateTicket = can(
    user,
    "ticket:create",
  );

  const isAdmin = user?.role === "admin";

  const [currentProject, setCurrentProject] =
    useState<Project | null>(project);

  const [statusMenuOpen, setStatusMenuOpen] =
    useState(false);

  const [updatingStatus, setUpdatingStatus] =
    useState(false);

  const [deleting, setDeleting] =
    useState(false);

  const [tickets, setTickets] =
    useState<Ticket[]>([]);

  const [users, setUsers] =
    useState<AuthUser[]>([]);

  const [loadingTickets, setLoadingTickets] =
    useState(false);

  const [ticketError, setTicketError] =
    useState<string | null>(null);

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    setCurrentProject(project);
    setStatusMenuOpen(false);
  }, [project]);

  useEffect(() => {
    if (!project || !open) {
      return;
    }

    const projectId = project.id;
    let cancelled = false;

    async function loadProjectTickets() {
      try {
        setLoadingTickets(true);
        setTicketError(null);

        const [ticketData, userData] =
          await Promise.all([
            getTickets(),
            getUsers(),
          ]);

        if (cancelled) {
          return;
        }

        setTickets(
          ticketData.filter(
            (ticket) =>
              ticket.project_id === projectId,
          ),
        );

        setUsers(userData);
      } catch {
        if (!cancelled) {
          setTicketError(
            "Failed to load project tickets.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingTickets(false);
        }
      }
    }

    loadProjectTickets();

    return () => {
      cancelled = true;
    };
  }, [project, open]);

  const projectOptions = useMemo(
    () =>
      currentProject
        ? [
            {
              id: currentProject.id,
              name: currentProject.name,
            },
          ]
        : [],
    [currentProject],
  );

  async function handleStatusChange(
    nextStatus: ProjectStatus,
  ) {
    if (
      !currentProject ||
      !isAdmin ||
      updatingStatus ||
      nextStatus === currentProject.status
    ) {
      setStatusMenuOpen(false);
      return;
    }

    const previousProject = currentProject;

    try {
      setUpdatingStatus(true);
      setError(null);
      setStatusMenuOpen(false);

      const optimisticProject = {
        ...currentProject,
        status: nextStatus,
      };

      setCurrentProject(optimisticProject);

      const updatedProject =
        await updateProject(
          currentProject.id,
          {
            status: nextStatus,
          },
        );

      setCurrentProject(updatedProject);
      onProjectUpdated(updatedProject);
    } catch {
      setCurrentProject(previousProject);

      setError("Failed to update project status.");
    } finally {
      setUpdatingStatus(false);
    }
  }

  async function handleCreateTicket(
    draft: TicketDraft,
  ) {
    if (!currentProject) {
      return;
    }

    const created = await createTicket({
      title: draft.title,
      summary: draft.summary,
      status: draft.status,
      priority: draft.priority,
      labels: draft.labels,
      project_id: currentProject.id,
      assignee_id: draft.assignee_id,
    });

    setTickets((current) => [
      created,
      ...current,
    ]);
  }

  async function handleDelete() {
    if (!currentProject) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete "${currentProject.name}"? This action cannot be undone.`,
    );

    if (!confirmed) return;

    try {
      setDeleting(true);
      setError(null);

      await deleteProject(currentProject.id);

      onOpenChange(false);
      onDeleted();
    } catch {
      setError("Failed to delete project.");
    } finally {
      setDeleting(false);
    }
  }

  if (!project || !open) {
    return null;
  }

  if (!currentProject) {
    return null;
  }

  const status = getStatusStyles(
    currentProject.status,
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="project-detail-title"
    >
      <button
        type="button"
        aria-label="Close project details"
        className="absolute inset-0 cursor-default bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={() => onOpenChange(false)}
      />

      <div
        className="
          relative z-10 flex w-full max-w-3xl flex-col
          overflow-hidden rounded-[24px]
          border border-[#2A2A2A]
          bg-[#0D0D0D]
          text-white
          shadow-2xl shadow-black/40
          animate-in fade-in zoom-in-95 slide-in-from-bottom-2
          duration-200
        "
      >
        <div className="h-px w-full bg-gradient-to-r from-transparent via-[var(--accent-color)]/50 to-transparent" />

        <div className="flex items-start justify-between gap-5 px-6 pb-5 pt-6 sm:px-7 sm:pt-7">
          <div className="min-w-0">
            <div className="relative mb-4">
              {isAdmin ? (
                <button
                  type="button"
                  disabled={updatingStatus}
                  onClick={() =>
                    setStatusMenuOpen((current) => !current)
                  }
                  className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] transition-all hover:brightness-110 disabled:cursor-wait disabled:opacity-60 ${status.className}`}
                >
                  <span
                    className={`mr-1.5 inline-block h-1.5 w-1.5 rounded-full ${status.dot}`}
                  />

                  {updatingStatus ? "Updating..." : status.label}

                  <span className="ml-2 text-[9px] opacity-60">
                    ▾
                  </span>
                </button>
              ) : (
                <Badge
                  variant="outline"
                  className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] ${status.className}`}
                >
                  <span
                    className={`mr-1.5 inline-block h-1.5 w-1.5 rounded-full ${status.dot}`}
                  />

                  {status.label}
                </Badge>
              )}

              {isAdmin && statusMenuOpen && (
                <div className="absolute left-0 top-full z-30 mt-2 w-40 overflow-hidden rounded-xl border border-[#2A2A2A] bg-[#141414] p-1.5 shadow-2xl shadow-black/40">
                  {(["active", "paused", "done"] as ProjectStatus[]).map(
                    (projectStatus) => {
                      const isSelected =
                        currentProject.status === projectStatus;

                      return (
                        <button
                          key={projectStatus}
                          type="button"
                          onClick={() =>
                            void handleStatusChange(projectStatus)
                          }
                          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs transition-colors hover:bg-[#1A1A1A]"
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              projectStatus === "active"
                                ? "bg-[var(--accent-color)]"
                                : projectStatus === "paused"
                                  ? "bg-[#888]"
                                  : "bg-[#AAA]"
                            }`}
                          />

                          <span
                            className={
                              projectStatus === "active"
                                ? "text-[var(--accent-color)]"
                                : "text-[#B0B0B0]"
                            }
                          >
                            {getStatusLabel(projectStatus)}
                          </span>

                          {isSelected && (
                            <Check className="ml-auto h-3.5 w-3.5 text-[var(--accent-color)]" />
                          )}
                        </button>
                      );
                    },
                  )}
                </div>
              )}
            </div>

            <h2
              id="project-detail-title"
              className="break-words text-2xl font-semibold tracking-[-0.04em] text-white sm:text-3xl"
            >
              {currentProject.name}
            </h2>

            <p className="mt-2 max-w-xl text-sm leading-6 text-[#777]">
              {currentProject.description ||
                "No project description provided."}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            {canEditProject && (
              <Button
                variant="outline"
                size="sm"
                className="hidden rounded-full border-[#2A2A2A] bg-[#141414] text-[#BDBDBD] hover:border-[#444] hover:bg-[#1A1A1A] hover:text-white sm:flex"
                onClick={() => onEdit(currentProject)}
                disabled={deleting}
              >
                <Pencil className="mr-2 h-3.5 w-3.5" />
                Edit
              </Button>
            )}

            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Close"
              className="h-9 w-9 rounded-full text-[#777] hover:bg-[#1A1A1A] hover:text-white"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <Separator className="bg-[#262626]" />

        <div className="max-h-[75vh] overflow-y-auto px-6 py-6 sm:px-7">
          <div className="space-y-6">
            {canEditProject && (
              <Button
                variant="outline"
                size="sm"
                className="w-full rounded-xl border-[#2A2A2A] bg-[#141414] text-[#BDBDBD] hover:border-[#444] hover:bg-[#1A1A1A] hover:text-white sm:hidden"
                onClick={() => onEdit(currentProject)}
                disabled={deleting}
              >
                <Pencil className="mr-2 h-4 w-4" />
                Edit project
              </Button>
            )}

            <div className="grid grid-cols-2 gap-3">
              <MetricCard
                icon={FolderKanban}
                label="Project ID"
                value={String(currentProject.id)}
              />

              <MetricCard
                icon={CheckCircle2}
                label="Status"
                value={status.label}
              />

              <MetricCard
                icon={CalendarDays}
                label="Deadline"
                value={
                  currentProject.deadline
                    ? new Date(currentProject.deadline).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "No deadline"
                }
              />

              <MetricCard
                icon={User}
                label="Created By"
                value={String(currentProject.created_by)}
              />
            </div>

            <section className="rounded-2xl border border-[#262626] bg-[#141414] p-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#666]">
                Objective
              </p>

              <p className="mt-3 text-sm leading-6 text-[#B0B0B0]">
                {currentProject.objective || "No objective provided."}
              </p>
            </section>

            <section>
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#666]">
                Description
              </p>

              <p className="mt-3 text-sm leading-6 text-[#999]">
                {currentProject.description || "No description provided."}
              </p>
            </section>

            <section className="rounded-2xl border border-[#262626] bg-[#111111]">
              <div className="flex flex-col gap-4 border-b border-[#262626] p-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-white">
                      Tickets
                    </h3>

                    <span className="rounded-full border border-[#262626] bg-[#1A1A1A] px-2 py-0.5 text-[10px] font-semibold text-[#999]">
                      {tickets.length}
                    </span>
                  </div>

                  <p className="mt-1 text-xs text-[#666]">
                    Engineering work linked to this project.
                  </p>
                </div>

                {canCreateTicket && (
                  <CreateTicketDialog
                    projects={projectOptions}
                    users={users}
                    currentUser={user}
                    projectId={currentProject.id}
                    projectName={currentProject.name}
                    triggerLabel="Create Ticket"
                    onCreate={handleCreateTicket}
                  />
                )}
              </div>

              <div className="p-4">
                {loadingTickets ? (
                  <div className="flex min-h-28 items-center justify-center">
                    <p className="text-sm text-[#666]">Loading tickets...</p>
                  </div>
                ) : ticketError ? (
                  <div className="rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3">
                    <p className="text-sm text-red-400">{ticketError}</p>
                  </div>
                ) : tickets.length === 0 ? (
                  <div className="flex min-h-32 flex-col items-center justify-center rounded-xl border border-dashed border-[#2A2A2A] bg-[#0D0D0D] px-6 text-center">
                    <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-full border border-[#262626] bg-[#141414]">
                      <CircleDot className="h-4 w-4 text-[#666]" />
                    </div>

                    <p className="text-sm font-medium text-white">No tickets yet</p>

                    <p className="mt-1 max-w-sm text-xs text-[#666]">
                      Create the first ticket for this project to start tracking its work.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {tickets.map((ticket) => (
                      <div
                        key={ticket.id}
                        className="group rounded-xl border border-[#262626] bg-[#141414] p-4 transition-colors hover:border-[#383838] hover:bg-[#181818]"
                      >
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="shrink-0 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--accent-color)]">
                                {ticket.key}
                              </span>

                              <span className="truncate text-sm font-medium text-white">
                                {ticket.title}
                              </span>
                            </div>

                            <p className="mt-1 line-clamp-2 text-xs leading-5 text-[#777]">
                              {ticket.summary}
                            </p>
                          </div>

                          <div className="flex shrink-0 items-center gap-2">
                            <span className="rounded-full border border-[#262626] bg-[#0D0D0D] px-2.5 py-1 text-[10px] font-medium text-[#999]">
                              {getTicketStatusLabel(ticket.status)}
                            </span>

                            <span
                              className={`text-[10px] font-semibold uppercase tracking-[0.1em] ${getPriorityClass(
                                ticket.priority,
                              )}`}
                            >
                              {ticket.priority}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>

            <div className="flex items-center justify-between border-t border-[#262626] pt-5">
              <span className="text-xs text-[#666]">Created</span>

              <span className="text-xs text-[#999]">
                {new Date(currentProject.created_at).toLocaleString()}
              </span>
            </div>

            {error && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}
          </div>
        </div>

        {canDeleteProject && (
          <div className="border-t border-[#262626] bg-[#0D0D0D] px-6 py-4 sm:px-7">
            <Button
              variant="ghost"
              className="w-full rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300"
              onClick={handleDelete}
              disabled={deleting}
            >
              <Trash2 className="mr-2 h-4 w-4" />

              {deleting ? "Deleting..." : "Delete project"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
