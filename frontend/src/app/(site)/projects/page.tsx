"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

import { ProjectCard } from "@/components/projects/project-card";
import { ProjectDetailSheet } from "@/components/projects/project-detail-sheet";
import { CreateProjectDialog } from "@/components/projects/create-project-dialog";

import {
  getProjects,
  type Project,
} from "@/lib/projects";

import { can } from "@/lib/rbac";
import { useAuthStore } from "@/store/auth-store";

type Filter = "all" | Project["status"];

export default function ProjectsPage() {
  const user = useAuthStore(
    (state) => state.user,
  );

  const canCreateProject = can(
    user,
    "project:create",
  );

  const [query, setQuery] = useState("");
  const [filter, setFilter] =
    useState<Filter>("all");

  const [createOpen, setCreateOpen] =
    useState(false);

  const [editProject, setEditProject] =
    useState<Project | null>(null);

  const [selectedProject, setSelectedProject] =
    useState<Project | null>(null);

  const [projects, setProjects] =
    useState<Project[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  async function loadProjects() {
    try {
      setLoading(true);
      setError(null);

      const data = await getProjects();
      setProjects(data);
    } catch {
      setError("Failed to load projects");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProjects();
  }, []);

  const filteredProjects = useMemo(() => {
    const q = query.trim().toLowerCase();

    return projects.filter((project) => {
      const matchesQuery =
        !q ||
        project.name.toLowerCase().includes(q) ||
        project.description
          .toLowerCase()
          .includes(q) ||
        project.objective
          .toLowerCase()
          .includes(q);

      const matchesFilter =
        filter === "all"
          ? true
          : project.status === filter;

      return matchesQuery && matchesFilter;
    });
  }, [projects, query, filter]);

  const activeCount = projects.filter(
    (project) =>
      project.status === "active",
  ).length;

  const pausedCount = projects.filter(
    (project) =>
      project.status === "paused",
  ).length;

  const doneCount = projects.filter(
    (project) =>
      project.status === "done",
  ).length;

  function handleEdit(project: Project) {
    setSelectedProject(null);
    setEditProject(project);
  }

  function handleCreateOpen(
    open: boolean,
  ) {
    setCreateOpen(open);

    if (!open) {
      setEditProject(null);
    }
  }

  function handleEditOpen(
    open: boolean,
  ) {
    if (!open) {
      setEditProject(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-2">
          <Badge
            variant="secondary"
            className="w-fit rounded-full border-[#262626] bg-[#141414] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#A0A0A0]"
          >
            Project workspace
          </Badge>

          <div>
            <h1 className="text-3xl font-semibold tracking-[-0.04em] text-white">
              Projects
            </h1>

            <p className="text-[#A0A0A0]">
              Track execution, members, and progress across active work.
            </p>
          </div>
        </div>

        {canCreateProject && (
          <Button
            className="rounded-full"
            onClick={() => setCreateOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            New project
          </Button>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="rounded-[20px] border-[#262626] bg-[#141414]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-[#A0A0A0]">
              Active
            </CardTitle>
          </CardHeader>

          <CardContent>
            <p className="text-3xl font-semibold text-white">
              {activeCount}
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-[20px] border-[#262626] bg-[#141414]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-[#A0A0A0]">
              Paused
            </CardTitle>
          </CardHeader>

          <CardContent>
            <p className="text-3xl font-semibold text-white">
              {pausedCount}
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-[20px] border-[#262626] bg-[#141414]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-[#A0A0A0]">
              Completed
            </CardTitle>
          </CardHeader>

          <CardContent>
            <p className="text-3xl font-semibold text-white">
              {doneCount}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-[20px] border-[#262626] bg-[#141414]">
        <CardContent className="space-y-5 p-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full lg:max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#666]" />

              <Input
                value={query}
                onChange={(e) =>
                  setQuery(e.target.value)
                }
                placeholder="Search projects..."
                className="pl-9"
              />
            </div>

            <Tabs
              value={filter}
              onValueChange={(value) =>
                setFilter(value as Filter)
              }
            >
              <TabsList>
                <TabsTrigger value="all">
                  All
                </TabsTrigger>

                <TabsTrigger value="active">
                  Active
                </TabsTrigger>

                <TabsTrigger value="paused">
                  Paused
                </TabsTrigger>

                <TabsTrigger value="done">
                  Done
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {loading ? (
            <div className="flex min-h-[280px] items-center justify-center rounded-[20px] border border-[#262626] bg-[#0D0D0D]">
              <p className="text-sm text-[#A0A0A0]">
                Loading projects...
              </p>
            </div>
          ) : error ? (
            <div className="flex min-h-[280px] items-center justify-center rounded-[20px] border border-red-500/20 bg-red-500/5">
              <p className="text-sm text-red-400">
                {error}
              </p>
            </div>
          ) : filteredProjects.length > 0 ? (
            <div className="grid gap-4 lg:grid-cols-3">
              {filteredProjects.map(
                (project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    onOpen={setSelectedProject}
                  />
                ),
              )}
            </div>
          ) : (
            <div className="flex min-h-[280px] flex-col items-center justify-center rounded-[20px] border border-dashed border-[#303030] bg-[#0D0D0D] p-8 text-center">
              <p className="text-lg font-medium text-white">
                No projects found
              </p>

              <p className="mt-1 max-w-sm text-sm text-[#A0A0A0]">
                Try a different search term or switch the status filter.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <ProjectDetailSheet
        project={selectedProject}
        open={Boolean(selectedProject)}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedProject(null);
          }
        }}
        onEdit={handleEdit}
        onDeleted={loadProjects}
      />

      <CreateProjectDialog
        open={
          createOpen || Boolean(editProject)
        }
        onOpenChange={(open) => {
          if (!open) {
            setCreateOpen(false);
            setEditProject(null);
          }
        }}
        project={editProject}
        onSaved={() => {
          setCreateOpen(false);
          setEditProject(null);
          loadProjects();
        }}
      />
    </div>
  );
}
