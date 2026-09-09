"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { getUsers } from "@/lib/users";
import type { User } from "@/types/auth";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { CreateTicketDialog } from "@/components/tickets/create-ticket-dialog";
import { TicketDetailSheet } from "@/components/tickets/ticket-detail-sheet";
import { TicketFilters } from "@/components/tickets/ticket-filters";
import { TicketsBoard } from "@/components/tickets/tickets-board";
import { TicketsTable } from "@/components/tickets/tickets-table";

import { getProjects, type Project } from "@/lib/projects";

import {
  createTicket,
  deleteTicket,
  getTickets,
  updateTicket,
} from "@/lib/tickets";

import { can } from "@/lib/rbac";
import { useAuthStore } from "@/store/auth-store";

import type {
  Ticket,
  TicketDraft,
  TicketStatus,
} from "@/lib/types";

export default function TicketsPage() {
  const user = useAuthStore((state) => state.user);

  const canCreateTicket = can(user, "ticket:create");

  const canDragTickets = can(
    user,
    "ticket:status:update",
  );

  const [query, setQuery] = useState("");
  const [view, setView] = useState<"board" | "table">("board");

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [ticketData, projectData, userData] = await Promise.all([
        getTickets(),
        getProjects(),
        getUsers(),
      ]);

      setTickets(ticketData);
      setProjects(projectData);
      setUsers(userData);
    } catch {
      setError("Failed to load tickets.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredTickets = useMemo(() => {
    const q = query.trim().toLowerCase();

    if (!q) {
      return tickets;
    }

    return tickets.filter((ticket) => {
      return (
        ticket.title.toLowerCase().includes(q) ||
        ticket.key.toLowerCase().includes(q) ||
        ticket.summary.toLowerCase().includes(q) ||
        ticket.labels.some((label) => label.toLowerCase().includes(q)) ||
        ticket.assignee?.name.toLowerCase().includes(q)
      );
    });
  }, [query, tickets]);

  async function handleCreateTicket(draft: TicketDraft) {
    try {
      setError(null);

      const created = await createTicket({
        title: draft.title,
        summary: draft.summary,
        status: draft.status,
        priority: draft.priority,
        labels: draft.labels,
        project_id: draft.project_id,
        assignee_id: draft.assignee_id,
      });

      setTickets((current) => [created, ...current]);
    } catch {
      setError("Failed to create ticket.");
    }
  }

  async function handleUpdateTicket(updatedTicket: Ticket) {
    try {
      setError(null);

      const updated = await updateTicket(updatedTicket.id, {
        title: updatedTicket.title,
        summary: updatedTicket.summary,
        status: updatedTicket.status,
        priority: updatedTicket.priority,
        labels: updatedTicket.labels,
        project_id: updatedTicket.project_id,
        assignee_id: updatedTicket.assignee?.id ?? null,
      });

      setTickets((current) =>
        current.map((ticket) => (ticket.id === updated.id ? updated : ticket)),
      );

      setSelectedTicket(updated);
    } catch {
      setError("Failed to update ticket.");
    }
  }

  async function handleDeleteTicket(ticketId: number) {
    try {
      setError(null);

      await deleteTicket(ticketId);

      setTickets((current) =>
        current.filter((ticket) => ticket.id !== ticketId),
      );

      setSelectedTicket(null);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to delete ticket.",
      );
    }
  }

  const projectOptions = useMemo(
    () =>
      projects.map((project) => ({
        id: project.id,
        name: project.name,
      })),
    [projects],
  );

  async function handleTicketStatusChange(
    ticket: Ticket,
    status: TicketStatus,
  ) {
    const previousStatus = ticket.status;

    setTickets((current) =>
      current.map((item) =>
        item.id === ticket.id
          ? {
              ...item,
              status,
            }
          : item,
      ),
    );

    try {
      const updated = await updateTicket(
        ticket.id,
        {
          status,
        },
      );

      setTickets((current) =>
        current.map((item) =>
          item.id === updated.id
            ? updated
            : item,
        ),
      );

      setSelectedTicket((current) =>
        current?.id === updated.id
          ? updated
          : current,
      );
    } catch {
      setTickets((current) =>
        current.map((item) =>
          item.id === ticket.id
            ? {
                ...item,
                status: previousStatus,
              }
            : item,
        ),
      );

      setError(
        "Failed to update ticket status.",
      );

      throw new Error(
        "Failed to update ticket status",
      );
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
            Ticket workspace
          </Badge>

          <div>
            <h1 className="text-3xl font-semibold tracking-[-0.04em] text-white">
              Tickets
            </h1>

            <p className="text-[#A0A0A0]">
              Track engineering work, debugging tasks, and product fixes.
            </p>
          </div>
        </div>

        {canCreateTicket && (
          <CreateTicketDialog
            projects={projectOptions}
            users={users}
            currentUser={user}
            onCreate={handleCreateTicket}
          />
        )}
      </div>

      <Card className="rounded-[20px] border-[#262626] bg-[#141414]">
        <CardHeader>
          <CardTitle className="text-base text-white">
            Ticket workspace
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-5">
          <TicketFilters
            query={query}
            onQueryChange={setQuery}
            view={view}
            onViewChange={setView}
          />

          {loading ? (
            <div className="flex min-h-[260px] items-center justify-center rounded-[20px] border border-[#262626] bg-[#0D0D0D]">
              <p className="text-sm text-[#A0A0A0]">Loading tickets...</p>
            </div>
          ) : error ? (
            <div className="flex min-h-[260px] items-center justify-center rounded-[20px] border border-red-500/20 bg-red-500/5">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          ) : filteredTickets.length > 0 ? (
            view === "board" ? (
              <TicketsBoard
                tickets={filteredTickets}
                onOpen={setSelectedTicket}
                canDrag={canDragTickets}
                onStatusChange={
                  handleTicketStatusChange
                }
              />
            ) : (
              <TicketsTable tickets={filteredTickets} onOpen={setSelectedTicket} />
            )
          ) : (
            <div className="flex min-h-[260px] flex-col items-center justify-center rounded-[20px] border border-dashed border-[#303030] bg-[#0D0D0D] p-8 text-center">
              <p className="text-lg font-medium text-white">No tickets found</p>

              <p className="mt-1 max-w-sm text-sm text-[#A0A0A0]">
                Try a different search term or clear the current filters.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <TicketDetailSheet
        key={selectedTicket?.id ?? "none"}
        ticket={selectedTicket}
        projects={projectOptions}
        users={users}
        open={Boolean(selectedTicket)}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedTicket(null);
          }
        }}
        onSave={handleUpdateTicket}
        onDelete={handleDeleteTicket}
      />
    </div>
  );
}