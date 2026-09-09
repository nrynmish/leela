import { apiFetch } from "@/lib/api";
import type { User, UserRole } from "@/types/auth";

export type UserRoleUpdate = {
  role: UserRole;
  department: string | null;
};

export async function getUsers(): Promise<User[]> {
  return apiFetch("/users");
}

export async function getAdminUsers(): Promise<User[]> {
  return apiFetch("/admin/users");
}

export async function updateUserRole(
  userId: number,
  payload: UserRoleUpdate,
): Promise<User> {
  return apiFetch(`/admin/users/${userId}/role`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}