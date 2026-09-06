import {
  Activity,
  ArrowUpRight,
  CircleCheck,
  CircleDot,
  Clock3,
} from "lucide-react";

import { Card } from "@/components/ui/card";

import type { Ticket } from "@/lib/tickets";

interface ActivityFeedProps {
  tickets: Ticket[];
  loading: boolean;
}

function formatTimestamp(timestamp: string) {
  const date = new Date(timestamp);

  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function ActivityFeed({
  tickets,
  loading,
}: ActivityFeedProps) {
  const activities = [...tickets]
    .sort(
      (a, b) =>
        new Date(b.updated_at).getTime() -
        new Date(a.updated_at).getTime(),
    )
    .slice(0, 8);

  return (
    <Card className="rounded-[20px] border-[#262626] bg-[#0D0D0D] text-white">
      <div className="flex items-center justify-between border-b border-[#262626] px-5 py-4">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-[#CBFF3D]" />

          <div>
            <h2 className="text-sm font-semibold">
              Recent Activity
            </h2>

            <p className="mt-0.5 text-[10px] text-[#666]">
              Latest ticket changes
            </p>
          </div>
        </div>

        <span className="rounded-full border border-[#262626] bg-[#141414] px-2.5 py-1 text-[9px] uppercase tracking-wider text-[#666]">
          Live
        </span>
      </div>

      <div className="p-4">
        {loading ? (
          <div className="flex min-h-[300px] items-center justify-center">
            <p className="text-xs text-[#666]">
              Loading activity...
            </p>
          </div>
        ) : activities.length === 0 ? (
          <div className="flex min-h-[300px] items-center justify-center">
            <div className="text-center">
              <Activity className="mx-auto mb-3 h-7 w-7 text-[#444]" />

              <p className="text-sm font-medium">
                No activity yet
              </p>

              <p className="mt-1 max-w-[220px] text-xs leading-5 text-[#666]">
                Ticket activity will appear here as work is
                created or updated.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-1">
            {activities.map((ticket) => {
              const completed = ticket.status === "done";

              return (
                <div
                  key={ticket.id}
                  className="group flex gap-3 rounded-xl p-3 transition hover:bg-[#141414]"
                >
                  <div className="relative flex shrink-0 flex-col items-center">
                    <div
                      className={`flex h-7 w-7 items-center justify-center rounded-full border ${
                        completed
                          ? "border-[#CBFF3D]/20 bg-[#CBFF3D]/10"
                          : "border-[#303030] bg-[#181818]"
                      }`}
                    >
                      {completed ? (
                        <CircleCheck className="h-3.5 w-3.5 text-[#CBFF3D]" />
                      ) : (
                        <CircleDot className="h-3.5 w-3.5 text-[#888]" />
                      )}
                    </div>

                    {ticket.id !== activities[activities.length - 1].id && (
                      <div className="mt-1 h-full w-px bg-[#252525]" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="truncate text-xs font-medium">
                        {ticket.key}: {ticket.title}
                      </p>

                      <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-[#444] transition group-hover:text-[#CBFF3D]" />
                    </div>

                    <div className="mt-1.5 flex items-center gap-2 text-[10px] text-[#666]">
                      <Clock3 className="h-3 w-3" />
                      {formatTimestamp(ticket.updated_at)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Card>
  );
}