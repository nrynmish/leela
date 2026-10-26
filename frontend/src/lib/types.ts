export type ProjectStatus = "active" | "paused" | "done";

export type Priority =
  | "low"
  | "medium"
  | "high"
  | "urgent";

export type TicketStatus =
  | "backlog"
  | "todo"
  | "in-progress"
  | "review"
  | "done";

export type Project = {
  id: number;
  name: string;
  objective: string;
  description: string;
  status: ProjectStatus;
  deadline: string | null;
  created_by: number;
  created_at: string;
  updated_at: string;
};

export type TicketAssignee = {
  id: number;
  name: string;
  initials: string;
};

export type Ticket = {
  id: number;
  key: string;
  title: string;
  summary: string;
  status: TicketStatus;
  priority: Priority;
  labels: string[];
  project_id: number;
  assignee: TicketAssignee | null;
  created_by: number;
  created_at: string;
  updated_at: string;
};

export type AssignmentMode = "individual" | "common";

export type TicketCreate = {
  title: string;
  summary: string;
  status: TicketStatus;
  priority: Priority;
  labels: string[];
  project_id: number;
  assignee_id: number | null;
  assignee_ids?: number[];
  assignment_mode?: AssignmentMode;
};

export type TicketUpdate = {
  title?: string;
  summary?: string;
  status?: TicketStatus;
  priority?: Priority;
  labels?: string[];
  project_id?: number;
  assignee_id?: number | null;
};

export type TicketDraft = {
  title: string;
  summary: string;
  status: TicketStatus;
  priority: Priority;
  project_id: number;
  assignee_id: number | null;
  assignee_ids: number[];
  assignment_mode: AssignmentMode;
  labels: string[];
};
