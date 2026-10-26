import { apiFetch } from "@/lib/api";
import type {
  AssignmentMode,
  Priority,
  TicketStatus,
} from "@/lib/types";

export function toApiIstTimestamp(value: string | null): string | null {
  if (!value || !value.trim()) {
    return null;
  }

  const trimmed = value.trim();

  if (/Z$/i.test(trimmed) || /[+-]\d{2}:?\d{2}$/.test(trimmed)) {
    const date = new Date(trimmed);
    if (Number.isNaN(date.getTime())) {
      return null;
    }
    return new Date(date.toISOString()).toISOString();
  }

  const match = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.exec(trimmed);
  if (!match) {
    return null;
  }

  const [datePart, timePart] = trimmed.split("T");
  const [year, month, day] = datePart.split("-").map(Number);
  const [hour, minute] = timePart.split(":").map(Number);

  if ([year, month, day, hour, minute].some((entry) => Number.isNaN(entry))) {
    return null;
  }

  const utcMs =
    Date.UTC(year, month - 1, day, hour, minute, 0) -
    (5 * 60 + 30) * 60 * 1000;

  return new Date(utcMs).toISOString();
}

export function toIstDateTimeLocal(value: string | null): string {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    })
      .formatToParts(date)
      .map(({ type, value }) => [type, value]),
  );

  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}`;
}

export type TicketAssignee = {
  id: number;
  name: string;
  initials: string;
};

export type TicketDeadlineHistory = {
  id: number;
  ticket_id: number;
  previous_deadline: string | null;
  new_deadline: string | null;
  changed_by: number | null;
  changed_at: string;
  reason: string | null;
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
  assignees: TicketAssignee[];
  deadline: string | null;
  drive_link_required: boolean;
  drive_link: string | null;
  submitted_by: number | null;
  submitted_at: string | null;
  review_feedback: string | null;
  deadline_history: TicketDeadlineHistory[];
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
  deadline?: string | null;
  drive_link_required?: boolean;
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
    body: JSON.stringify({
      ...payload,
      deadline: payload.deadline
        ? toApiIstTimestamp(payload.deadline)
        : null,
    }),
  });
}

export async function createBulkTickets(
  payload: TicketCreate,
): Promise<BulkTicketCreateResponse> {
  return apiFetch("/tickets/bulk", {
    method: "POST",
    body: JSON.stringify({
      ...payload,
      deadline: payload.deadline
        ? toApiIstTimestamp(payload.deadline)
        : null,
    }),
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

export async function submitTicketForReview(
  id: number,
  driveLink?: string | null,
): Promise<Ticket> {
  return apiFetch(`/tickets/${id}/submit-review`, {
    method: "POST",
    body: JSON.stringify({
      drive_link: driveLink ?? null,
    }),
  });
}

export async function reviewTicket(
  id: number,
  decision: "approve" | "request_changes",
  feedback?: string | null,
  driveLink?: string | null,
): Promise<Ticket> {
  return apiFetch(`/tickets/${id}/review`, {
    method: "POST",
    body: JSON.stringify({
      decision,
      feedback: feedback ?? null,
      drive_link: driveLink ?? null,
    }),
  });
}

export async function updateTicketDeadline(
  id: number,
  deadline: string | null,
  reason?: string | null,
): Promise<Ticket> {
  return apiFetch(`/tickets/${id}/deadline`, {
    method: "PATCH",
    body: JSON.stringify({
      deadline: deadline
        ? toApiIstTimestamp(deadline)
        : null,
      reason: reason ?? null,
    }),
  });
}
