export type Workspace = {
  id: string;
  name: string;
  role: string;
};

export type ProjectStatus = "active" | "paused" | "done";

export type Priority = "low" | "medium" | "high" | "urgent";

export type TicketStatus = "backlog" | "todo" | "in-progress" | "review" | "done";

export type Project = {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  progress: number;
  dueDate: string;
  members: {
    name: string;
    initials: string;
  }[];
};

export type Ticket = {
  id: string;
  key: string;
  title: string;
  summary: string;
  status: TicketStatus;
  priority: Priority;
  labels: string[];
  projectId: string;
  assignee: {
    name: string;
    initials: string;
  };
  updatedAt: string;
};

export type ActivityItem = {
  id: string;
  actor: string;
  action: string;
  target: string;
  time: string;
};

export type NotificationItem = {
  id: string;
  title: string;
  description: string;
  time: string;
  unread?: boolean;
};

export type StatItem = {
  label: string;
  value: string;
  delta: string;
  direction: "up" | "down";
};