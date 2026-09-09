import {
  FolderKanban,
  LayoutDashboard,
  Settings,
  Ticket,
  User,
  Users,
} from "lucide-react";

import type { UserRole } from "@/types/auth";

type NavigationItem = {
  title: string;
  href: string;
  icon: typeof LayoutDashboard;
  roles?: UserRole[];
};

export const navigation: NavigationItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Projects",
    href: "/projects",
    icon: FolderKanban,
  },
  {
    title: "Tickets",
    href: "/tickets",
    icon: Ticket,
  },
  {
    title: "Profile",
    href: "/profile",
    icon: User,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
  },
  {
    title: "Users",
    href: "/settings/users",
    icon: Users,
    roles: ["admin"],
  },
];