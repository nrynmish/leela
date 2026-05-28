import { ArrowDownRight, ArrowUpRight, BarChart3, CheckCircle2, CircleAlert, Kanban } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { stats } from "@/lib/mock-data";

const iconMap = [Kanban, CircleAlert, BarChart3, CheckCircle2];

export function StatsCards() {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat, index) => {
        const Icon = iconMap[index] ?? BarChart3;
        const positive = stat.direction === "up";

        return (
          <Card key={stat.label} className="transition-transform duration-200 hover:-translate-y-1 hover:shadow-md">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-3xl font-semibold tracking-tight">{stat.value}</p>
                  <div className="flex items-center gap-1 text-xs">
                    {positive ? (
                      <ArrowUpRight className="h-3.5 w-3.5 text-emerald-500" />
                    ) : (
                      <ArrowDownRight className="h-3.5 w-3.5 text-amber-500" />
                    )}
                    <span className={positive ? "text-emerald-500" : "text-amber-500"}>
                      {stat.delta}
                    </span>
                    <span className="text-muted-foreground">from last week</span>
                  </div>
                </div>

                <div className="rounded-2xl border bg-muted/40 p-3">
                  <Icon className="h-5 w-5 text-foreground/80" />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}