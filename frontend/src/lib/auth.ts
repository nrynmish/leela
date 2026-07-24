import { apiFetch } from "@/lib/api";
import type {
  LoginRequest,
  TokenResponse,
  User,
} from "@/types/auth";

export async function login(
  payload: LoginRequest,
): Promise<TokenResponse> {
  return apiFetch("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getCurrentUser(): Promise<User> {
  return apiFetch("/users/me");
}