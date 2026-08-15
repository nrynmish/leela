import { notFound } from "next/navigation";

import { getProject } from "@/lib/projects";

import { ProjectHeader } from "@/components/projects/project-header";
import { ProjectMetadata } from "@/components/projects/project-metadata";

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{
    id: string;
  }>;
}) {
  const { id } = await params;

  let project;

  try {
    project = await getProject(Number(id));
  } catch {
    notFound();
  }

  return (
    <div className="space-y-6">
      <ProjectHeader project={project} />

      <ProjectMetadata
        status={project.status}
        deadline={project.deadline}
        createdBy={project.created_by}
      />
    </div>
  );
}