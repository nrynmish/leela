"use client";

import { Bell, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/common/theme-toggle";
import { useAuthStore } from "@/store/auth-store";

export function Topbar() {
  const router = useRouter();

  const user = useAuthStore(
    (state) => state.user,
  );

  const logout = useAuthStore(
    (state) => state.logout,
  );

  function handleLogout() {
    logout();

    router.replace("/login");
  }

  const initials =
    user?.full_name
      ?.split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() ?? "U";

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

        <div className="hidden flex-col text-right md:flex">
          <span className="text-sm font-medium">
            {user?.full_name ?? "User"}
          </span>

          <span className="text-xs text-muted-foreground">
            {user?.role ?? ""}
          </span>
        </div>

        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
          {initials}
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
}