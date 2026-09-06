"use client";

import { useEffect, useState } from "react";

import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { DashboardHero } from "@/components/dashboard/dashboard-hero";
import { ProjectCards } from "@/components/dashboard/project-cards";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { getProjects, type Project } from "@/lib/projects";
import { getTickets, type Ticket } from "@/lib/tickets";

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [projectData, ticketData] = await Promise.all([
          getProjects(),
          getTickets(),
        ]);

        setProjects(projectData);
        setTickets(ticketData);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  return (
    <div className="min-h-full bg-[#0A0A0A] text-white">
      <div className="mx-auto max-w-[1600px] space-y-5">
        <DashboardHero
          projects={projects}
          tickets={tickets}
          loading={loading}
        />

        <StatsCards
          projects={projects}
          tickets={tickets}
          loading={loading}
        />

        <div className="grid gap-5 xl:grid-cols-[1.45fr_0.75fr]">
          <ProjectCards
            projects={projects}
            tickets={tickets}
            loading={loading}
          />

          <ActivityFeed
            tickets={tickets}
            loading={loading}
          />
        </div>
      </div>
    </div>
  );
}