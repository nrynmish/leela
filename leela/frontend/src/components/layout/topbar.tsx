import { Bell } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/common/theme-toggle";

export function Topbar() {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center border-b bg-background/80 px-6 backdrop-blur">
      <div className="flex flex-1 items-center justify-center">
        <h1 className="font-mono text-base font-bold uppercase tracking-[0.45em] text-foreground">
          UGV-DTU
        </h1>
      </div>

      <div className="absolute right-6 flex items-center gap-2">
        <Button variant="ghost" size="icon">
          <Bell className="h-5 w-5" />
        </Button>

        <ThemeToggle />

        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
          DS
        </div>
      </div>
    </header>
  );
}