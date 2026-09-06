import {
  BarChart3,
  CheckCircle2,
  CircleAlert,
  Kanban,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

import type { Project } from "@/lib/projects";
import type { Ticket } from "@/lib/tickets";

interface StatsCardsProps {
  projects: Project[];
  tickets: Ticket[];
  loading: boolean;
}

function DistributionBar({
  value,
  total,
}: {
  value: number;
  total: number;
}) {
  const percentage =
    total === 0 ? 0 : Math.min((value / total) * 100, 100);

  return (
    <div className="mt-5 h-2 overflow-hidden rounded-full bg-[#2E2E2E]">
      <div
        className="h-full rounded-full bg-[#CBFF3D] transition-all"
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}

export function StatsCards({
  projects,
  tickets,
  loading,
}: StatsCardsProps) {
  const activeProjects = projects.filter(
    (project) => project.status === "active",
  ).length;

  const openTickets = tickets.filter(
    (ticket) => ticket.status !== "done",
  ).length;

  const reviewTickets = tickets.filter(
    (ticket) => ticket.status === "review",
  ).length;

  const completedTickets = tickets.filter(
    (ticket) => ticket.status === "done",
  ).length;

  const stats = [
    {
      label: "Active Projects",
      value: activeProjects,
      icon: Kanban,
      detail: `${projects.length} total projects`,
      barValue: activeProjects,
      barTotal: projects.length,
    },
    {
      label: "Open Tickets",
      value: openTickets,
      icon: CircleAlert,
      detail: `${tickets.length} total tickets`,
      barValue: openTickets,
      barTotal: tickets.length,
    },
    {
      label: "In Review",
      value: reviewTickets,
      icon: BarChart3,
      detail: `${tickets.length} total tickets`,
      barValue: reviewTickets,
      barTotal: tickets.length,
    },
    {
      label: "Completed",
      value: completedTickets,
      icon: CheckCircle2,
      detail: `${tickets.length} total tickets`,
      barValue: completedTickets,
      barTotal: tickets.length,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;

        return (
          <Card
            key={stat.label}
            className="rounded-[18px] border-[#262626] bg-[#141414] text-white transition-colors hover:border-[#383838]"
          >
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-[#9A9A9A]" />
                  <span className="text-xs font-medium text-[#BDBDBD]">
                    {stat.label}
                  </span>
                </div>

                <span className="text-xs text-[#555]">
                  ↗
                </span>
              </div>

              <div className="mt-5">
                <p className="text-3xl font-semibold tracking-[-0.04em]">
                  {loading ? "—" : stat.value}
                </p>

                <p className="mt-1 text-[11px] text-[#777]">
                  {loading ? "Loading workspace..." : stat.detail}
                </p>
              </div>

              {!loading && (
                <DistributionBar
                  value={stat.barValue}
                  total={stat.barTotal}
                />
              )}

              <div className="mt-3 flex justify-between text-[10px] uppercase tracking-wider text-[#555]">
                <span>Current</span>
                <span>
                  {loading || stat.barTotal === 0
                    ? "—"
                    : `${Math.round(
                        (stat.barValue / stat.barTotal) * 100,
                      )}%`}
                </span>
              </div>
            </CardContent>
          </Card>
        );
      } )}
    </div>
  );
}