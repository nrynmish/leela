import { apiFetch } from "@/lib/api";

export type ProjectStatus = "active" | "paused" | "done";

export type Project = {
  id: number;
  name: string;
  objective: string;
  description: string;
  status: ProjectStatus;
  deadline: string | null;
  created_by: number;
  created_at: string;
  updated_at: string;
};

export type ProjectCreate = {
  name: string;
  objective: string;
  description: string;
  deadline?: string | null;
};

export type ProjectUpdate = {
  name?: string;
  objective?: string;
  description?: string;
  status?: ProjectStatus;
  deadline?: string | null;
};

export async function getProjects(): Promise<Project[]> {
  return apiFetch("/projects");
}

export async function getProject(
  id: number,
): Promise<Project> {
  return apiFetch(`/projects/${id}`);
}

export async function createProject(
  payload: ProjectCreate,
): Promise<Project> {
  return apiFetch("/projects", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateProject(
  id: number,
  payload: ProjectUpdate,
): Promise<Project> {
  return apiFetch(`/projects/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function deleteProject(
  id: number,
): Promise<void> {
  await apiFetch(`/projects/${id}`, {
    method: "DELETE",
  });
}