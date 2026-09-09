import { apiFetch } from "@/lib/api";
import type { User } from "@/types/auth";

export async function getPendingRegistrations(): Promise<
  User[]
> {
  return apiFetch("/admin/registrations");
}

export async function approveRegistration(
  userId: number,
): Promise<User> {
  return apiFetch(
    `/admin/registrations/${userId}/approve`,
    {
      method: "PATCH",
    },
  );
}

export async function rejectRegistration(
  userId: number,
): Promise<User> {
  return apiFetch(
    `/admin/registrations/${userId}/reject`,
    {
      method: "PATCH",
    },
  );
}
