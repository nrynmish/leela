"use client";

import { useMemo, useState } from "react";

import { TicketFilters } from "@/components/tickets/ticket-filters";
import { TicketsBoard } from "@/components/tickets/tickets-board";
import { TicketsTable } from "@/components/tickets/tickets-table";
import { TicketDetailSheet } from "@/components/tickets/ticket-detail-sheet";
import { tickets } from "@/lib/mock-data";
import type { Ticket } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TicketsPage() {
  const [query, setQuery] = useState("");
  const [view, setView] = useState<"board" | "table">("board");
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

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
  }, [query]);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Tickets</h1>
        <p className="text-muted-foreground">
          Track engineering work, debugging tasks, and product fixes.
        </p>
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
        ticket={selectedTicket}
        open={Boolean(selectedTicket)}
        onOpenChange={(open) => {
          if (!open) setSelectedTicket(null);
        }}
      />
    </div>
  );
}