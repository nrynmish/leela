"use client";

import { Ticket } from "@/lib/types";
const ticketStatuses = [
  "backlog",
  "todo",
  "in-progress",
  "review",
  "done",
] as const;
import { TicketCard } from "./ticket-card";

const titles: Record<string, string> = {
  backlog: "Backlog",
  todo: "Todo",
  "in-progress": "In Progress",
  review: "Review",
  done: "Done",
};

export function TicketsBoard({
  tickets,
  onOpen,
}: {
  tickets: Ticket[];
  onOpen: (ticket: Ticket) => void;
}) {
  return (
    <div className="grid gap-4 xl:grid-cols-5">
      {ticketStatuses.map((status) => {
        const columnTickets = tickets.filter((ticket) => ticket.status === status);

        return (
          <div key={status} className="space-y-3 rounded-3xl border bg-muted/20 p-3">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-sm font-semibold">{titles[status]}</h3>
              <span className="text-xs text-muted-foreground">{columnTickets.length}</span>
            </div>

            <div className="space-y-3">
              {columnTickets.map((ticket) => (
                <TicketCard key={ticket.id} ticket={ticket} onOpen={onOpen} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}