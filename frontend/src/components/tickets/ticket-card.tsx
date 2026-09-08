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
    <Card
      onClick={() => onOpen(ticket)}
      className="group cursor-pointer rounded-[18px] border-[#262626] bg-[#141414] transition-all duration-200 hover:-translate-y-1 hover:border-[#3A3A3A] hover:bg-[#181818] hover:shadow-md"
    >
      <CardContent className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-[#A0A0A0]">
                {ticket.key}
              </p>
              <PriorityBadge priority={ticket.priority} />
            </div>

            <p className="text-left text-base font-semibold tracking-tight text-white">
              {ticket.title}
            </p>

            <p className="line-clamp-2 text-sm text-[#A0A0A0]">
              {ticket.summary}
            </p>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 rounded-full border border-[#262626] bg-[#0D0D0D] text-[#A0A0A0] hover:bg-[#1A1A1A] hover:text-white"
            onClick={(event) => event.stopPropagation()}
          >
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
                  <p className="text-sm font-medium text-white">
                    {ticket.assignee.name}
                  </p>
                  <p className="text-xs text-[#A0A0A0]">
                    {ticket.updated_at}
                  </p>
                </div>
              </>
            ) : (
              <div className="leading-tight">
                <p className="text-sm font-medium text-[#A0A0A0]">
                  Unassigned
                </p>
                <p className="text-xs text-[#A0A0A0]">
                  {ticket.updated_at}
                </p>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1 text-xs text-[#A0A0A0]">
            <MessageSquare className="h-3.5 w-3.5" />
            3
          </div>
        </div>
      </CardContent>
    </Card>
  );
}