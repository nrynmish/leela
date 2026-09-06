"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { navigation } from "./navigation";

import { cn } from "@/lib/utils";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-[290px] border-r border-[#262626] bg-[#0D0D0D] lg:flex lg:flex-col">
      <div className="flex h-28 items-center justify-center border-b border-[#262626] px-4">
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
                "group relative flex items-center gap-3 rounded-[18px] px-4 py-3 text-sm font-medium transition-all duration-200",
                pathname === item.href
                  ? "bg-[#CBFF3D]/10 text-white ring-1 ring-[#CBFF3D]/20"
                  : "text-[#A0A0A0] hover:bg-[#1A1A1A] hover:text-white"
              )}
            >
              {pathname === item.href ? (
                <div className="absolute left-0 top-2 h-8 w-1 rounded-r-full bg-[#CBFF3D]" />
              ) : null}

              <Icon className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />

              <span>{item.title}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-[#262626] p-4">
        <div className="rounded-[18px] border border-[#262626] bg-[#141414] p-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#A0A0A0]">
            System
          </p>

          <div className="mt-3 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white">UGV-DTU</p>
              <p className="text-xs text-[#A0A0A0]">
                Robotics Workspace
              </p>
            </div>

            <div className="h-2.5 w-2.5 rounded-full bg-[#CBFF3D] ring-4 ring-[#CBFF3D]/20" />
          </div>
        </div>
      </div>
    </aside>
  );
}