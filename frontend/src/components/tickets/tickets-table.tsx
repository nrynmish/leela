"use client";

import type { Ticket } from "@/lib/types";
import { LabelPills } from "./label-pills";
import { PriorityBadge } from "./priority-badge";
import { AssigneeAvatar } from "./assignee-avatar";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function TicketsTable({
  tickets,
  onOpen,
}: {
  tickets: Ticket[];
  onOpen: (ticket: Ticket) => void;
}) {
  return (
    <div className="rounded-[20px] border border-[#262626] bg-[#0D0D0D] shadow-none">
      <Table>
        <TableHeader>
          <TableRow className="border-[#262626] bg-[#141414] hover:bg-[#141414]">
            <TableHead className="text-[#A0A0A0]">Ticket</TableHead>
            <TableHead className="text-[#A0A0A0]">Priority</TableHead>
            <TableHead className="text-[#A0A0A0]">Labels</TableHead>
            <TableHead className="text-[#A0A0A0]">Assignee</TableHead>
            <TableHead className="text-[#A0A0A0]">Updated</TableHead>
            <TableHead className="text-right text-[#A0A0A0]" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {tickets.map((ticket) => (
            <TableRow key={ticket.id} className="border-[#262626] hover:bg-[#141414]">
              <TableCell>
                <div className="space-y-1">
                  <p className="font-medium text-white">{ticket.key}</p>
                  <p className="text-sm text-[#A0A0A0]">{ticket.title}</p>
                </div>
              </TableCell>
              <TableCell>
                <PriorityBadge priority={ticket.priority} />
              </TableCell>
              <TableCell>
                <LabelPills labels={ticket.labels} />
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  {ticket.assignee ? (
                    <>
                      <AssigneeAvatar
                        name={ticket.assignee.name}
                        initials={ticket.assignee.initials}
                      />
                      <span className="text-sm text-white">{ticket.assignee.name}</span>
                    </>
                  ) : (
                    <span className="text-sm text-[#A0A0A0]">
                      Unassigned
                    </span>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-sm text-[#A0A0A0]">
                {ticket.updated_at}
              </TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="sm" onClick={() => onOpen(ticket)} className="rounded-full text-[#A0A0A0] hover:bg-[#1A1A1A] hover:text-white">
                  Open
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}