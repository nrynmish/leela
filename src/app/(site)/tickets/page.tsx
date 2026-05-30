"use client";

import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreateTicketDialog } from "@/components/tickets/create-ticket-dialog";
import { TicketDetailSheet } from "@/components/tickets/ticket-detail-sheet";
import { TicketFilters } from "@/components/tickets/ticket-filters";
import { TicketsBoard } from "@/components/tickets/tickets-board";
import { TicketsTable } from "@/components/tickets/tickets-table";
import { projects as projectMockData, tickets as initialTickets } from "@/lib/mock-data";
import type {Ticket, TicketDraft } from "@/lib/types";

function initialsFromName(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function nextTicketKey(existingTickets: Ticket[]) {
  const maxNumber = existingTickets.reduce((max, ticket) => {
    const match = ticket.key.match(/-(\d+)/);
    const number = match ? Number(match[1]) : 0;
    return Math.max(max, number);
  }, 0);

  return `LEL-${String(maxNumber + 1).padStart(3, "0")}`;
}

export default function TicketsPage() {
  const [query, setQuery] = useState("");
  const [view, setView] = useState<"board" | "table">("board");
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>(initialTickets);

  const filteredTickets = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return tickets;

    return tickets.filter((ticket) => {
      return (
        ticket.title.toLowerCase().includes(q) ||
        ticket.key.toLowerCase().includes(q) ||
        ticket.summary.toLowerCase().includes(q) ||
        ticket.labels.some((label) => label.toLowerCase().includes(q)) ||
        ticket.assignee.name.toLowerCase().includes(q)
      );
    });
  }, [query, tickets]);

  function handleCreateTicket(ticket: TicketDraft) {
    setTickets((current) => [
      {
        id: crypto.randomUUID(),
        key: nextTicketKey(current),
        title: ticket.title,
        summary: ticket.summary,
        status: ticket.status,
        priority: ticket.priority,
        labels: ticket.labels,
        projectId: ticket.projectId,
        assignee: {
          name: ticket.assignee,
          initials: initialsFromName(ticket.assignee),
        },
        updatedAt: "Just now",
      },
      ...current,
    ]);
  }

  function handleUpdateTicket(updatedTicket: Ticket) {
    setTickets((current) =>
      current.map((ticket) =>
        ticket.id === updatedTicket.id ? updatedTicket : ticket
      )
    );
    setSelectedTicket(updatedTicket);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-2">
          <Badge variant="secondary" className="w-fit rounded-full px-3 py-1">
            Ticket workspace
          </Badge>
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Tickets</h1>
            <p className="text-muted-foreground">
              Track engineering work, debugging tasks, and product fixes.
            </p>
          </div>
        </div>

        <CreateTicketDialog
          projects={projectMockData}
          onCreate={handleCreateTicket}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Ticket workspace</CardTitle>
        </CardHeader>

        <CardContent className="space-y-5">
          <TicketFilters
            query={query}
            onQueryChange={setQuery}
            view={view}
            onViewChange={setView}
          />

          {filteredTickets.length > 0 ? (
            view === "board" ? (
              <TicketsBoard tickets={filteredTickets} onOpen={setSelectedTicket} />
            ) : (
              <TicketsTable tickets={filteredTickets} onOpen={setSelectedTicket} />
            )
          ) : (
            <div className="flex min-h-[260px] flex-col items-center justify-center rounded-3xl border border-dashed p-8 text-center">
              <p className="text-lg font-medium">No tickets found</p>
              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                Try a different search term or clear the current filters.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <TicketDetailSheet
        key={selectedTicket?.id ?? "none"}
        ticket={selectedTicket}
        projects={projectMockData}
        open={Boolean(selectedTicket)}
        onOpenChange={(open) => {
          if (!open) setSelectedTicket(null);
        }}
        onSave={handleUpdateTicket}
      />
    </div>
  );
}