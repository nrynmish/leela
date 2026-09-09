"use client";

import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { register } from "@/lib/auth";

export function RegisterForm() {

  const [rollNo, setRollNo] = useState("");
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [department, setDepartment] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] =
    useState<string | null>(null);
  const [success, setSuccess] =
    useState(false);

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>,
  ) {
    e.preventDefault();

    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setError(
        "Password must be at least 8 characters",
      );
      return;
    }

    try {
      setLoading(true);

      const user = await register({
        roll_no: rollNo.trim(),
        email: email.trim(),
        full_name: fullName.trim(),
        department: department.trim(),
        password,
      });

      if (user.status !== "pending") {
        setError(
          "Registration was created with an unexpected status.",
        );
        return;
      }

      setSuccess(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to complete registration",
      );
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="w-full max-w-lg rounded-[28px] border border-[#262626] bg-[#0D0D0D] p-10 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--accent-color)_12%,transparent)] text-2xl text-[var(--accent-color)]">
          ✓
        </div>

        <h1 className="mt-6 text-3xl font-bold text-white">
          Registration submitted
        </h1>

        <p className="mt-4 text-[#A0A0A0]">
          Your account has been created and is
          waiting for admin approval.
        </p>

        <p className="mt-2 text-sm text-[#707070]">
          You will be able to sign in once an
          administrator approves your registration.
        </p>

        <Link href="/login">
          <Button className="mt-8 w-full">
            Return to Sign In
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl rounded-[28px] border border-[#262626] bg-[#0D0D0D] p-8 lg:p-10">
      <div className="mb-8">
        <Link
          href="/login"
          className="text-sm text-[#707070] hover:text-white"
        >
          ← Back to Sign In
        </Link>

        <h1 className="mt-6 text-4xl font-bold text-white">
          Create your account
        </h1>

        <p className="mt-3 text-[#A0A0A0]">
          Register for access to the Leela workspace.
          Your account requires admin approval.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-5"
      >
        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-white">
              Full Name
            </label>

            <Input
              placeholder="Your full name"
              value={fullName}
              onChange={(e) =>
                setFullName(e.target.value)
              }
              required
            />
          </div>

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
              required
            />
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-white">
              Email
            </label>

            <Input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-white">
              Department
            </label>

            <Input
              placeholder="e.g. Research and Outreach"
              value={department}
              onChange={(e) =>
                setDepartment(e.target.value)
              }
              required
            />
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-white">
              Password
            </label>

            <Input
              type="password"
              placeholder="Minimum 8 characters"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              minLength={8}
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-white">
              Confirm Password
            </label>

            <Input
              type="password"
              placeholder="Repeat your password"
              value={confirmPassword}
              onChange={(e) =>
                setConfirmPassword(e.target.value)
              }
              minLength={8}
              required
            />
          </div>
        </div>

        {error && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <Button
          type="submit"
          size="lg"
          className="w-full"
          disabled={loading}
        >
          {loading
            ? "Submitting Registration..."
            : "Create Account"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-[#707070]">
        Already have an account?{" "}
        <Link
          href="/login"
          className="text-[var(--accent-color)] hover:underline"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
