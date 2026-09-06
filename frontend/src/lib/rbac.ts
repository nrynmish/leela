import type { User } from "@/types/auth";

export type Permission =
  | "project:view"
  | "project:create"
  | "project:edit"
  | "project:delete"
  | "project:comment"
  | "ticket:view"
  | "ticket:create"
  | "ticket:edit"
  | "ticket:delete";

interface TicketLike {
  created_by: number;
}

export function can(
  user: User | null,
  permission: Permission,
  ticket?: TicketLike,
): boolean {
  if (!user) {
    return false;
  }

  switch (permission) {
    case "project:view":
    case "project:comment":
    case "ticket:view":
      return true;

    case "project:create":
    case "project:edit":
      return (
        user.role === "admin" ||
        user.role === "head"
      );

    case "project:delete":
      return user.role === "admin";

    case "ticket:create":
      return (
        user.role === "admin" ||
        user.role === "head"
      );

    case "ticket:edit":
      return (
        user.role === "admin" ||
        (
          user.role === "head" &&
          ticket?.created_by === user.id
        )
      );

    case "ticket:delete":
      return (
        user.role === "admin" ||
        (
          user.role === "head" &&
          ticket?.created_by === user.id
        )
      );

    default:
      return false;
  }
}