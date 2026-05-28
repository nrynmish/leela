"use client";

import { CalendarDays, Clock3, UserRound } from "lucide-react";

import { LabelPills } from "./label-pills";
import { PriorityBadge } from "./priority-badge";

import type { Ticket } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";

export function TicketDetailSheet({
  ticket,
  open,
  onOpenChange,
}: {
  ticket: Ticket | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl">
        {ticket ? (
          <div className="space-y-6 pt-6">
            <SheetHeader className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="rounded-full">
                  {ticket.key}
                </Badge>
                <PriorityBadge priority={ticket.priority} />
              </div>
              <SheetTitle className="text-2xl">{ticket.title}</SheetTitle>
              <SheetDescription>{ticket.summary}</SheetDescription>
            </SheetHeader>

            <Separator />

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="rounded-2xl border p-4">
                  <div className="mb-2 flex items-center gap-2 text-muted-foreground">
                    <UserRound className="h-4 w-4" />
                    Assignee
                  </div>
                  <p className="font-medium">{ticket.assignee.name}</p>
                </div>
                <div className="rounded-2xl border p-4">
                  <div className="mb-2 flex items-center gap-2 text-muted-foreground">
                    <CalendarDays className="h-4 w-4" />
                    Updated
                  </div>
                  <p className="font-medium">{ticket.updatedAt}</p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">Labels</p>
                <LabelPills labels={ticket.labels} />
              </div>

              <div className="rounded-2xl border p-4">
                <div className="mb-2 flex items-center gap-2 text-sm font-medium">
                  <Clock3 className="h-4 w-4" />
                  Notes
                </div>
                <p className="text-sm text-muted-foreground">
                  Add comments, attach screenshots, and capture debugging notes here later.
                </p>
              </div>
            </div>
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}