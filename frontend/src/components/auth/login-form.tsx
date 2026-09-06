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
    <div className="flex w-full max-w-7xl overflow-hidden rounded-[28px] border border-[#262626] bg-[#0D0D0D]">
      <div className="hidden w-1/2 border-r border-[#262626] bg-[radial-gradient(circle_at_top_left,rgba(203,255,61,0.11),transparent_25%),linear-gradient(135deg,#0D0D0D_0%,#11150B_100%)] p-12 lg:flex lg:flex-col lg:justify-between">
        <div>
          <h1 className="text-5xl font-black tracking-tight text-[#CBFF3D]">
            LEELA
          </h1>

          <p className="mt-2 text-lg text-[#A0A0A0]">
            UGV-DTU
          </p>
        </div>

        <div className="max-w-md">
          <h2 className="text-5xl font-bold leading-tight text-white">
            Plan. Build. Track.
            <br />
            <span className="text-[#CBFF3D]">
              Ship Together.
            </span>
          </h2>

          <p className="mt-8 text-xl text-[#A0A0A0]">
            Leela helps engineering teams
            plan projects, track progress,
            manage tickets, and ship
            better together.
          </p>
        </div>
      </div>

      <div className="flex w-full items-center justify-center p-10 lg:w-1/2 lg:p-16">
        <div className="w-full max-w-md">
          <h2 className="text-5xl font-bold text-white">
            Welcome back
          </h2>

          <p className="mt-4 text-lg text-[#A0A0A0]">
            Sign in to your Leela account
          </p>

          <form
            onSubmit={handleSubmit}
            className="mt-10 space-y-6"
          >
            <div>
              <label className="mb-2 block text-sm font-medium text-white">
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
              <label className="mb-2 block text-sm font-medium text-white">
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
              <p className="text-sm text-red-400">
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