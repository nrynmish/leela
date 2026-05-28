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
    <div className="rounded-3xl border bg-background shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Ticket</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Labels</TableHead>
            <TableHead>Assignee</TableHead>
            <TableHead>Updated</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {tickets.map((ticket) => (
            <TableRow key={ticket.id}>
              <TableCell>
                <div className="space-y-1">
                  <p className="font-medium">{ticket.key}</p>
                  <p className="text-sm text-muted-foreground">{ticket.title}</p>
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
                  <AssigneeAvatar
                    name={ticket.assignee.name}
                    initials={ticket.assignee.initials}
                  />
                  <span className="text-sm">{ticket.assignee.name}</span>
                </div>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {ticket.updatedAt}
              </TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="sm" onClick={() => onOpen(ticket)}>
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