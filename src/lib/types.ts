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

export type TicketDraft = {
  title: string;
  summary: string;
  status: TicketStatus;
  priority: Priority;
  projectId: string;
  assignee: string;
  labels: string[];
};