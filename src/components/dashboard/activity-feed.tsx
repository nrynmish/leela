"use client";

import {
  Activity,
  MessageSquare,
  ArrowRightLeft,
  CheckCircle2,
  Plus,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { activity } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

function getActionMeta(action: string) {
  const value = action.toLowerCase();

  if (value.includes("created")) {
    return {
      label: "Created",
      icon: Plus,
      tone: "border-emerald-500/20 bg-emerald-500/10 text-emerald-600",
    };
  }

  if (value.includes("moved")) {
    return {
      label: "Moved",
      icon: ArrowRightLeft,
      tone: "border-blue-500/20 bg-blue-500/10 text-blue-600",
    };
  }

  if (value.includes("commented")) {
    return {
      label: "Commented",
      icon: MessageSquare,
      tone: "border-violet-500/20 bg-violet-500/10 text-violet-600",
    };
  }

  if (value.includes("closed")) {
    return {
      label: "Closed",
      icon: CheckCircle2,
      tone: "border-emerald-500/20 bg-emerald-500/10 text-emerald-600",
    };
  }

  return {
    label: "Update",
    icon: Activity,
    tone: "border-muted-foreground/20 bg-muted/50 text-muted-foreground",
  };
}

export function ActivityFeed() {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Activity className="h-4 w-4" />
          Activity timeline
        </CardTitle>
      </CardHeader>

      <CardContent>
        <ScrollArea className="h-[360px] pr-4">
          <div className="space-y-4">
            {activity.map((item, index) => {
              const meta = getActionMeta(item.action);
              const Icon = meta.icon;

              return (
                <div key={item.id} className="relative pl-10">
                  {index !== activity.length - 1 ? (
                    <div className="absolute left-[18px] top-8 h-full w-px bg-border" />
                  ) : null}

                  <div
                    className={cn(
                      "absolute left-0 top-0 flex h-9 w-9 items-center justify-center rounded-full border",
                      meta.tone
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </div>

                  <div className="space-y-1 rounded-2xl border bg-background p-4 shadow-sm transition-shadow hover:shadow-md">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm">
                        <span className="font-medium">{item.actor}</span>{" "}
                        <span className="text-muted-foreground">{item.action}</span>{" "}
                        <span className="font-medium">{item.target}</span>
                      </p>

                      <span className="rounded-full border bg-muted/40 px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
                        {meta.label}
                      </span>
                    </div>

                    <p className="text-xs text-muted-foreground">{item.time}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}