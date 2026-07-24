"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/store/auth-store";

export function LoginForm() {
  const router = useRouter();

  const loginUser = useAuthStore(
    (state) => state.loginUser,
  );

  const [rollNo, setRollNo] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>,
  ) {
    e.preventDefault();

    try {
      setLoading(true);
      setError(null);

      await loginUser({
        roll_no: rollNo,
        password,
      });

      router.push("/dashboard");
    } catch {
      setError(
        "Invalid roll number or password",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex w-full max-w-7xl overflow-hidden rounded-3xl border bg-card shadow-2xl">
      <div className="hidden w-1/2 border-r bg-gradient-to-br from-background via-background to-muted/20 p-12 lg:flex lg:flex-col lg:justify-between">
        <div>
          <h1 className="text-5xl font-black tracking-tight text-primary">
            LEELA
          </h1>

          <p className="mt-2 text-lg text-muted-foreground">
            UGV-DTU
          </p>
        </div>

        <div className="max-w-md">
          <h2 className="text-5xl font-bold leading-tight">
            Plan. Build. Track.
            <br />
            <span className="text-primary">
              Ship Together.
            </span>
          </h2>

          <p className="mt-8 text-xl text-muted-foreground">
            Leela helps engineering teams
            plan projects, track progress,
            manage tickets, and ship
            better together.
          </p>
        </div>

      </div>

      <div className="flex w-full items-center justify-center p-10 lg:w-1/2 lg:p-16">
        <div className="w-full max-w-md">
          <h2 className="text-5xl font-bold">
            Welcome back
          </h2>

          <p className="mt-4 text-lg text-muted-foreground">
            Sign in to your Leela account
          </p>

          <form
            onSubmit={handleSubmit}
            className="mt-10 space-y-6"
          >
            <div>
              <label className="mb-2 block text-sm font-medium">
                Roll Number
              </label>

              <Input
                placeholder="e.g. 24/EN/038"
                value={rollNo}
                onChange={(e) =>
                  setRollNo(e.target.value)
                }
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Password
              </label>

              <Input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) =>
                  setPassword(
                    e.target.value,
                  )
                }
              />
            </div>

            {error && (
              <p className="text-sm text-red-500">
                {error}
              </p>
            )}

            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={loading}
            >
              {loading
                ? "Signing In..."
                : "Sign In"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}