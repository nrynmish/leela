"use client";

import { useEffect, useMemo, useState } from "react";

import { AdminProfile } from "@/components/profile/admin-profile";
import { HeadProfile } from "@/components/profile/head-profile";
import { MemberProfile } from "@/components/profile/member-profile";

import { getProjects } from "@/lib/projects";
import type { Project } from "@/lib/projects";

import { getTickets } from "@/lib/tickets";
import type { Ticket } from "@/lib/tickets";

import type {
  ActivityItem,
  CompleteProfile,
} from "@/lib/profile-types";

import { useAuthStore } from "@/store/auth-store";

function formatActivityTime(timestamp: string) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(timestamp));
}

export default function ProfilePage() {
  const authUser = useAuthStore(
    (state) => state.user,
  );

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfileData() {
      try {
        const [ticketData, projectData] =
          await Promise.all([
            getTickets(),
            getProjects(),
          ]);

        setTickets(ticketData);
        setProjects(projectData);
      } finally {
        setLoading(false);
      }
    }

    loadProfileData();
  }, []);

  const profile = useMemo<CompleteProfile | null>(() => {
    if (!authUser) {
      return null;
    }

    const assignedTickets = tickets.filter(
      (ticket) =>
        ticket.assignee?.id === authUser.id,
    );

    const createdTickets = tickets.filter(
      (ticket) =>
        ticket.created_by === authUser.id,
    );

    const relevantTickets =
      authUser.role === "member"
        ? assignedTickets
        : createdTickets;

    const completedTickets =
      assignedTickets.filter(
        (ticket) => ticket.status === "done",
      );

    const activeProjects = projects.filter(
      (project) =>
        project.status === "active" &&
        project.created_by === authUser.id,
    );

    const activity: ActivityItem[] =
      [...relevantTickets]
        .sort(
          (a, b) =>
            new Date(b.updated_at).getTime() -
            new Date(a.updated_at).getTime(),
        )
        .slice(0, 5)
        .map((ticket) => ({
          id: String(ticket.id),
          action: `Updated ${ticket.key}: ${ticket.title}`,
          timestamp: formatActivityTime(
            ticket.updated_at,
          ),
        }));

    return {
      ...authUser,
      stats: {
        ticketsAssigned: assignedTickets.length,
        ticketsCompleted: completedTickets.length,
        activeProjects: activeProjects.length,
      },
      activity,
    };
  }, [
    authUser,
    projects,
    tickets,
  ]);

  if (!authUser || loading || !profile) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-sm text-muted-foreground">
          Loading profile...
        </p>
      </div>
    );
  }

  if (profile.role === "member") {
    return <MemberProfile user={profile} />;
  }

  if (profile.role === "head") {
    return <HeadProfile user={profile} />;
  }

  return <AdminProfile user={profile} />;
}
