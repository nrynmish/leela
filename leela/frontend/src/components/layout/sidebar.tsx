"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { navigation } from "./navigation";

import { cn } from "@/lib/utils";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-[290px] border-r bg-background/95 backdrop-blur lg:flex lg:flex-col">
      <div className="flex h-28 items-center justify-center border-b px-4">
        <Image
          src="/images/leela-ascii.png"
          alt="Leela ASCII Logo"
          width={260}
          height={70}
          className="h-auto w-full object-contain opacity-90"
          priority
        />
      </div>

      <nav className="flex flex-1 flex-col gap-2 p-4">
        {navigation.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group relative flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all duration-200",
                pathname === item.href
                  ? "bg-primary/10 text-foreground shadow-sm ring-1 ring-primary/10"
                  : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
              )}
            >
              {pathname === item.href ? (
                <div className="absolute left-0 top-2 h-8 w-1 rounded-r-full bg-primary" />
              ) : null}

              <Icon className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />

              <span>{item.title}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t p-4">
        <div className="rounded-2xl border bg-muted/30 p-4">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">
            System
          </p>

          <div className="mt-3 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">UGV-DTU</p>
              <p className="text-xs text-muted-foreground">
                Robotics Workspace
              </p>
            </div>

            <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(34,197,94,0.8)]" />
          </div>
        </div>
      </div>
    </aside>
  );
}