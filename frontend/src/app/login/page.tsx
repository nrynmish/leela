// src/app/login/page.tsx

import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0A0A0A] p-6">
      <LoginForm />
    </main>
  );
}