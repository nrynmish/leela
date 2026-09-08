"use client";

import { useState } from "react";

import type {
  Ticket,
  TicketStatus,
} from "@/lib/types";

import { TicketCard } from "./ticket-card";

const ticketStatuses = [
  "backlog",
  "todo",
  "in-progress",
  "review",
  "done",
] as const satisfies readonly TicketStatus[];

const titles: Record<
  TicketStatus,
  string
> = {
  backlog: "Backlog",
  todo: "Todo",
  "in-progress": "In Progress",
  review: "Review",
  done: "Done",
};

const descriptions: Record<
  TicketStatus,
  string
> = {
  backlog: "Not yet planned",
  todo: "Ready to start",
  "in-progress": "Currently being worked on",
  review: "Waiting for review",
  done: "Completed work",
};

export function TicketsBoard({
  tickets,
  onOpen,
  canDrag,
  onStatusChange,
}: {
  tickets: Ticket[];
  onOpen: (ticket: Ticket) => void;
  canDrag: boolean;
  onStatusChange: (
    ticket: Ticket,
    status: TicketStatus,
  ) => Promise<void>;
}) {
  const [draggedTicketId, setDraggedTicketId] =
    useState<number | null>(null);

  const [dragOverStatus, setDragOverStatus] =
    useState<TicketStatus | null>(null);

  const [updatingTicketId, setUpdatingTicketId] =
    useState<number | null>(null);

  async function handleDrop(
    status: TicketStatus,
  ) {
    if (
      !canDrag ||
      draggedTicketId === null
    ) {
      return;
    }

    const ticket = tickets.find(
      (item) =>
        item.id === draggedTicketId,
    );

    if (!ticket) {
      return;
    }

    if (ticket.status === status) {
      setDraggedTicketId(null);
      setDragOverStatus(null);
      return;
    }

    try {
      setUpdatingTicketId(ticket.id);

      await onStatusChange(
        ticket,
        status,
      );
    } finally {
      setUpdatingTicketId(null);
      setDraggedTicketId(null);
      setDragOverStatus(null);
    }
  }

  return (
    <div className="grid gap-4 xl:grid-cols-5">
      {ticketStatuses.map((status) => {
        const columnTickets =
          tickets.filter(
            (ticket) =>
              ticket.status === status,
          );

        const isDragTarget =
          canDrag &&
          dragOverStatus === status;

        return (
          <div
            key={status}
            onDragOver={(event) => {
              if (!canDrag) {
                return;
              }

              event.preventDefault();
              setDragOverStatus(status);
            }}
            onDragLeave={(event) => {
              if (
                event.currentTarget ===
                event.target
              ) {
                setDragOverStatus(null);
              }
            }}
            onDrop={(event) => {
              event.preventDefault();

              if (canDrag) {
                void handleDrop(status);
              }
            }}
            className={`
              min-h-[180px]
              space-y-3
              rounded-[20px]
              border
              p-3
              transition-all
              duration-200
              ${
                isDragTarget
                  ? "border-[#CBFF3D]/60 bg-[#CBFF3D]/[0.04] shadow-[0_0_0_1px_rgba(203,255,61,0.12)]"
                  : "border-[#262626] bg-[#0D0D0D]"
              }
            `}
          >
            <div className="px-1">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white">
                  {titles[status]}
                </h3>

                <span className="rounded-full border border-[#262626] bg-[#141414] px-2 py-0.5 text-[10px] font-medium text-[#A0A0A0]">
                  {columnTickets.length}
                </span>
              </div>

              <p className="mt-1 text-[10px] text-[#555]">
                {descriptions[status]}
              </p>
            </div>

            <div className="space-y-3">
              {columnTickets.map(
                (ticket) => {
                  const isUpdating =
                    updatingTicketId ===
                    ticket.id;

                  return (
                    <div
                      key={ticket.id}
                      draggable={
                        canDrag &&
                        !isUpdating
                      }
                      onDragStart={(event) => {
                        if (!canDrag) {
                          return;
                        }

                        setDraggedTicketId(
                          ticket.id,
                        );

                        event.dataTransfer.effectAllowed =
                          "move";

                        event.dataTransfer.setData(
                          "text/plain",
                          String(ticket.id),
                        );
                      }}
                      onDragEnd={() => {
                        setDraggedTicketId(
                          null,
                        );

                        setDragOverStatus(
                          null,
                        );
                      }}
                      className={`
                        transition-all
                        duration-200
                        ${
                          canDrag
                            ? "cursor-grab active:cursor-grabbing"
                            : ""
                        }
                        ${
                          draggedTicketId ===
                          ticket.id
                            ? "scale-[0.98] opacity-40"
                            : ""
                        }
                        ${
                          isUpdating
                            ? "pointer-events-none opacity-50"
                            : ""
                        }
                      `}
                    >
                      <TicketCard
                        ticket={ticket}
                        onOpen={onOpen}
                      />
                    </div>
                  );
                },
              )}
            </div>

            {canDrag &&
              isDragTarget &&
              columnTickets.length === 0 && (
                <div className="flex min-h-20 items-center justify-center rounded-xl border border-dashed border-[#CBFF3D]/30 bg-[#CBFF3D]/[0.03]">
                  <p className="text-xs text-[#CBFF3D]">
                    Drop ticket here
                  </p>
                </div>
              )}
          </div>
        );
      })}
    </div>
  );
}