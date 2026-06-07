import { notFound } from "next/navigation";

import { projects } from "@/lib/mock-data";

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

  const project = projects.find(
    (project) => project.id === id
  );

  if (!project) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <ProjectHeader project={project} />

      <ProjectMetadata
        progress={project.progress}
        deadline={project.deadline}
        ticketCount={project.ticketCount}
      />
    </div>
  );
}