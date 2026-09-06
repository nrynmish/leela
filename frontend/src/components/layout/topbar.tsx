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
    <header className="sticky top-0 z-30 flex h-16 items-center border-b border-[#262626] bg-[#0D0D0D]/90 px-6 backdrop-blur-sm">
      <div className="flex flex-1 items-center justify-center">
        <h1 className="font-mono text-base font-bold uppercase tracking-[0.45em] text-white">
          UGV-DTU
        </h1>
      </div>

      <div className="absolute right-6 flex items-center gap-2">
        <Button variant="ghost" size="icon" className="rounded-full border border-[#262626] bg-[#141414] text-[#A0A0A0] hover:bg-[#1A1A1A] hover:text-white">
          <Bell className="h-4 w-4" />
        </Button>

        <ThemeToggle />

        <div className="hidden flex-col text-right md:flex">
          <span className="text-sm font-medium text-white">
            {user?.full_name ?? "User"}
          </span>

          <span className="text-xs text-[#A0A0A0]">
            {user?.role ?? ""}
          </span>
        </div>

        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#CBFF3D] text-sm font-medium text-[#0A0A0A]">
          {initials}
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={handleLogout}
          className="rounded-full border border-[#262626] bg-[#141414] text-[#A0A0A0] hover:bg-[#1A1A1A] hover:text-white"
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}