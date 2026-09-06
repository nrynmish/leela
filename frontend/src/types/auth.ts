export type UserRole =
  | "member"
  | "head"
  | "admin";

export interface LoginRequest {
  roll_no: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface User {
  id: number;
  roll_no: string;
  email: string;
  full_name: string;
  department: string;
  role: UserRole;
}