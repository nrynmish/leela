"use client";

import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function TicketFilters({
  query,
  onQueryChange,
  view,
  onViewChange,
}: {
  query: string;
  onQueryChange: (value: string) => void;
  view: "board" | "table";
  onViewChange: (value: "board" | "table") => void;
}) {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div className="relative w-full lg:max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Search tickets..."
          className="pl-9"
        />
      </div>

      <Tabs value={view} onValueChange={(v) => onViewChange(v as "board" | "table")}>
        <TabsList>
          <TabsTrigger value="board">Board</TabsTrigger>
          <TabsTrigger value="table">Table</TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}