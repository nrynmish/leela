import type { User } from "@/types/auth";

export type ActivityItem = {
  id: string;
  action: string;
  timestamp: string;
};

export type ProfileStats = {
  ticketsAssigned: number;
  ticketsCompleted: number;
  activeProjects: number;
};

export type CompleteProfile = User & {
  stats: ProfileStats;
  activity: ActivityItem[];
};
