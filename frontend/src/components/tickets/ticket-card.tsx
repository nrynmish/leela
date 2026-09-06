"use client";

import { MessageSquare, MoreHorizontal } from "lucide-react";

import type { Ticket } from "@/lib/types";
import { LabelPills } from "./label-pills";
import { PriorityBadge } from "./priority-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AssigneeAvatar } from "./assignee-avatar";

export function TicketCard({
  ticket,
  onOpen,
}: {
  ticket: Ticket;
  onOpen: (ticket: Ticket) => void;
}) {
  return (
    <Card className="group transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
      <CardContent className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <p className="text-xs font-medium text-muted-foreground">
                {ticket.key}
              </p>
              <PriorityBadge priority={ticket.priority} />
            </div>

            <button
              onClick={() => onOpen(ticket)}
              className="text-left text-base font-semibold tracking-tight transition-colors hover:text-primary"
            >
              {ticket.title}
            </button>

            <p className="line-clamp-2 text-sm text-muted-foreground">
              {ticket.summary}
            </p>
          </div>

          <Button variant="ghost" size="icon" className="shrink-0">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>

        <LabelPills labels={ticket.labels} />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {ticket.assignee ? (
              <>
                <AssigneeAvatar
                  name={ticket.assignee.name}
                  initials={ticket.assignee.initials}
                />

                <div className="leading-tight">
                  <p className="text-sm font-medium">
                    {ticket.assignee.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {ticket.updated_at}
                  </p>
                </div>
              </>
            ) : (
              <div className="leading-tight">
                <p className="text-sm font-medium text-muted-foreground">
                  Unassigned
                </p>
                <p className="text-xs text-muted-foreground">
                  {ticket.updated_at}
                </p>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <MessageSquare className="h-3.5 w-3.5" />
            3
          </div>
        </div>
      </CardContent>
    </Card>
  );
}