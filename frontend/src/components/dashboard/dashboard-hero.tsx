import Link from "next/link";
import {
  ArrowUpRight,
  Bell,
  CalendarDays,
  ChevronDown,
  LayoutDashboard,
  Plus,
  Search,
  Settings,
  Ticket,
} from "lucide-react";

import { Button } from "@/components/ui/button";

import type { Project } from "@/lib/projects";
import type { Ticket as TicketType } from "@/lib/tickets";

interface DashboardHeroProps {
  projects: Project[];
  tickets: TicketType[];
  loading: boolean;
}

export function DashboardHero({
  projects,
  tickets,
  loading,
}: DashboardHeroProps) {
  const activeProjects = projects.filter(
    (project) => project.status === "active",
  ).length;

  const openTickets = tickets.filter(
    (ticket) => ticket.status !== "done",
  ).length;

  return (
    <section className="overflow-hidden rounded-[24px] border border-[#262626] bg-[#0D0D0D]">
      {/* Top navigation */}
      <div className="flex flex-col gap-4 border-b border-[#262626] px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-5">
          <Link
            href="/dashboard"
            className="flex items-center gap-2"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#CBFF3D] text-black">
              <LayoutDashboard className="h-4 w-4" />
            </div>

            <span className="font-semibold tracking-tight">
              LEELA
            </span>
          </Link>

          <nav className="hidden items-center gap-1 rounded-full border border-[#262626] bg-[#141414] p-1 md:flex">
            <Link
              href="/dashboard"
              className="rounded-full bg-[#CBFF3D] px-4 py-2 text-xs font-semibold text-black"
            >
              Overview
            </Link>

            <Link
              href="/projects"
              className="rounded-full px-4 py-2 text-xs text-[#9A9A9A] transition hover:text-white"
            >
              Projects
            </Link>

            <Link
              href="/tickets"
              className="rounded-full px-4 py-2 text-xs text-[#9A9A9A] transition hover:text-white"
            >
              Tickets
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden h-9 w-64 items-center gap-2 rounded-full border border-[#262626] bg-[#141414] px-3 lg:flex">
            <Search className="h-3.5 w-3.5 text-[#666]" />
            <span className="text-xs text-[#666]">
              Search workspace
            </span>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="rounded-full border border-[#262626] bg-[#141414] text-[#9A9A9A] hover:bg-[#1A1A1A] hover:text-white"
          >
            <Bell className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="rounded-full border border-[#262626] bg-[#141414] text-[#9A9A9A] hover:bg-[#1A1A1A] hover:text-white"
          >
            <Settings className="h-4 w-4" />
          </Button>

          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1A1A1A] text-xs font-semibold">
            L
          </div>
        </div>
      </div>

      {/* Hero */}
      <div className="relative overflow-hidden px-6 py-8 lg:px-8 lg:py-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(203,255,61,0.11),transparent_32%),linear-gradient(135deg,#0D0D0D_0%,#11150B_100%)]" />

        <div className="relative grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div>
            <div className="mb-5 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-[#7D7D7D]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#CBFF3D]" />
              Engineering workspace
            </div>

            <h1 className="max-w-2xl text-4xl font-semibold tracking-[-0.04em] md:text-5xl">
              Engineering
              <br />
              <span className="text-[#CBFF3D]">
                Command Center.
              </span>
            </h1>

            <p className="mt-4 max-w-xl text-sm leading-6 text-[#8C8C8C]">
              Your projects, tickets, and engineering activity
              at a glance.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/tickets">
                <Button className="rounded-full bg-[#CBFF3D] px-5 text-black hover:bg-[#CBFF3D]/90">
                  <Plus className="mr-2 h-4 w-4" />
                  New Ticket
                </Button>
              </Link>

              <Link href="/projects">
                <Button
                  variant="outline"
                  className="rounded-full border-[#303030] bg-[#141414] px-5 text-white hover:bg-[#1A1A1A]"
                >
                  View Projects
                  <ArrowUpRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Insight cards */}
          <div className="relative mx-auto h-52 w-full max-w-md">
            <div className="absolute right-2 top-5 h-40 w-64 rotate-6 rounded-2xl border border-[#CBFF3D]/10 bg-[#CBFF3D]/5" />

            <div className="absolute right-6 top-2 h-44 w-72 -rotate-3 rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-sm" />

            <div className="absolute right-0 top-7 w-full max-w-sm rounded-2xl border border-[#343434] bg-[#F0F4DF] p-5 text-[#101010] shadow-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-semibold">
                  <span className="h-2 w-2 rounded-full bg-[#CBFF3D]" />
                  Workspace Insight
                </div>

                <ArrowUpRight className="h-4 w-4" />
              </div>

              <p className="mt-5 text-2xl font-semibold tracking-tight">
                {loading ? "—" : openTickets}
              </p>

              <p className="mt-1 text-xs text-[#555]">
                open tickets across{" "}
                <strong>{loading ? "—" : activeProjects}</strong>{" "}
                active projects
              </p>

              <div className="mt-5 flex items-center gap-2 text-[11px] text-[#666]">
                <CalendarDays className="h-3.5 w-3.5" />
                Live workspace data
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile navigation */}
      <div className="flex border-t border-[#262626] p-3 md:hidden">
        <Link href="/projects" className="flex-1">
          <Button variant="ghost" className="w-full rounded-full text-xs">
            Projects
          </Button>
        </Link>

        <Link href="/tickets" className="flex-1">
          <Button variant="ghost" className="w-full rounded-full text-xs">
            <Ticket className="mr-2 h-3.5 w-3.5" />
            Tickets
          </Button>
        </Link>

        <Button variant="ghost" className="flex-1 rounded-full text-xs">
          <ChevronDown className="mr-2 h-3.5 w-3.5" />
          More
        </Button>
      </div>
    </section>
  );
}