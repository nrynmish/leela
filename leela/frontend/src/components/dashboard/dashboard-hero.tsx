import { ArrowRight, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function DashboardHero() {
  return (
    <div className="relative overflow-hidden rounded-3xl border bg-gradient-to-br from-primary/10 via-background to-background p-6 shadow-sm">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.10),transparent_35%)]" />
      <div className="relative flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-3">
          <Badge variant="secondary" className="w-fit rounded-full px-3 py-1">
            Leela dashboard
          </Badge>
          <div className="space-y-1">
            <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
              Fuck around and find out.
            </h1>
            <p className="max-w-2xl text-sm text-muted-foreground md:text-base">
              Basically F.R.I.D.A.Y.
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" className="rounded-full">
            View roadmap
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <Button className="rounded-full">
            <Plus className="mr-2 h-4 w-4" />
            New ticket
          </Button>
        </div>
      </div>
    </div>
  );
}