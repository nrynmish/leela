import { apiFetch } from "@/lib/api";
import type { User } from "@/types/auth";

export async function getUsers(): Promise<User[]> {
  return apiFetch("/users");
}