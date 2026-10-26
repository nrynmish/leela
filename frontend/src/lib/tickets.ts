import { apiFetch } from "@/lib/api";
import type {
  AssignmentMode,
  Priority,
  TicketStatus,
} from "@/lib/types";

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

export type TicketUpdate = Partial<TicketCreate>;

export type BulkTicketCreateResponse = {
  created_count: number;
  assignment_mode: AssignmentMode;
  tickets: Ticket[];
};

export async function getTickets(): Promise<Ticket[]> {
  return apiFetch("/tickets");
}

export async function getTicket(id: number): Promise<Ticket> {
  return apiFetch(`/tickets/${id}`);
}

export async function createTicket(
  payload: TicketCreate,
): Promise<Ticket> {
  return apiFetch("/tickets", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function createBulkTickets(
  payload: TicketCreate,
): Promise<BulkTicketCreateResponse> {
  return apiFetch("/tickets/bulk", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateTicket(
  id: number,
  payload: TicketUpdate,
): Promise<Ticket> {
  return apiFetch(`/tickets/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function deleteTicket(id: number): Promise<void> {
  await apiFetch(`/tickets/${id}`, {
    method: "DELETE",
  });
}
