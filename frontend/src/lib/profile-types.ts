import type { User } from "@/types/auth";

export type UserRole =
  | "member"
  | "head"
  | "admin";

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

export type HeadStats = {
  ticketsAssignedByMe: number;
  membersManaged: number;
  teamTicketsClosed: number;
};

export type AdminStats = {
  totalMembers: number;
  totalHeads: number;
  totalProjects: number;
  openTickets: number;
  closedTickets: number;
};

export type ProfileExtras = {
  avatar?: string;

  skills: string[];

  stats: ProfileStats;

  headStats?: HeadStats;

  adminStats?: AdminStats;

  activity: ActivityItem[];
};

export type CompleteProfile =
  User & ProfileExtras;