"use client";

import { useEffect, useState } from "react";
import { Check, Loader2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth-store";
import {
  approveRegistration,
  getPendingRegistrations,
  rejectRegistration,
} from "@/lib/registrations";

import type { User } from "@/types/auth";

export default function RegistrationsPage() {
  const user = useAuthStore((state) => state.user);

  const [registrations, setRegistrations] =
    useState<User[]>([]);

  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] =
    useState<number | null>(null);

  const [error, setError] =
    useState<string | null>(null);

  async function loadRegistrations() {
    try {
      setLoading(true);
      setError(null);

      const data =
        await getPendingRegistrations();

      setRegistrations(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load registrations",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (user?.role !== "admin") {
      setLoading(false);
      return;
    }

    let isMounted = true;

    async function fetchData() {
      try {
        setLoading(true);
        setError(null);

        const data = await getPendingRegistrations();

        if (isMounted) {
          setRegistrations(data);
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load registrations",
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    void fetchData();

    return () => {
      isMounted = false;
    };
  }, [user?.role]);

  async function handleApprove(id: number) {
    try {
      setActionId(id);
      setError(null);

      await approveRegistration(id);

      setRegistrations((current) =>
        current.filter(
          (registration) =>
            registration.id !== id,
        ),
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to approve registration",
      );
    } finally {
      setActionId(null);
    }
  }

  async function handleReject(id: number) {
    try {
      setActionId(id);
      setError(null);

      await rejectRegistration(id);

      setRegistrations((current) =>
        current.filter(
          (registration) =>
            registration.id !== id,
        ),
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to reject registration",
      );
    } finally {
      setActionId(null);
    }
  }

  if (user?.role !== "admin") {
    return (
      <div className="rounded-[24px] border border-[#262626] bg-[#0D0D0D] p-8">
        <h1 className="text-2xl font-bold text-white">
          Access denied
        </h1>

        <p className="mt-2 text-[#A0A0A0]">
          Only administrators can manage registrations.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-[#707070]">
          Administration
        </p>

        <h1 className="mt-2 text-3xl font-bold text-white">
          Registration Requests
        </h1>

        <p className="mt-2 text-[#A0A0A0]">
          Review and approve new members before they
          can access Leela.
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <div className="rounded-[24px] border border-[#262626] bg-[#0D0D0D]">
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <Loader2 className="h-5 w-5 animate-spin text-[var(--accent-color)]" />
          </div>
        ) : registrations.length === 0 ? (
          <div className="p-12 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#171717] text-[#707070]">
              ✓
            </div>

            <h2 className="mt-4 text-lg font-semibold text-white">
              No pending registrations
            </h2>

            <p className="mt-2 text-sm text-[#707070]">
              New registration requests will appear
              here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#262626]">
            {registrations.map((registration) => {
              const processing =
                actionId === registration.id;

              return (
                <div
                  key={registration.id}
                  className="flex flex-col gap-5 p-6 lg:flex-row lg:items-center lg:justify-between"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="font-semibold text-white">
                        {registration.full_name}
                      </h2>

                      <span className="rounded-full bg-[color-mix(in_srgb,var(--accent-color)_10%,transparent)] px-2.5 py-1 text-xs text-[var(--accent-color)]">
                        Member
                      </span>
                    </div>

                    <div className="mt-3 grid gap-x-8 gap-y-1 text-sm text-[#A0A0A0] md:grid-cols-2">
                      <span>
                        Roll No:{" "}
                        <strong className="font-normal text-white">
                          {registration.roll_no}
                        </strong>
                      </span>

                      <span>
                        Department:{" "}
                        <strong className="font-normal text-white">
                          {registration.department}
                        </strong>
                      </span>

                      <span className="md:col-span-2">
                        Email:{" "}
                        <strong className="font-normal text-white">
                          {registration.email}
                        </strong>
                      </span>
                    </div>
                  </div>

                  <div className="flex shrink-0 gap-3">
                    <Button
                      variant="outline"
                      onClick={() =>
                        handleReject(
                          registration.id,
                        )
                      }
                      disabled={processing}
                      className="border-red-500/20 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                    >
                      {processing ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <X className="h-4 w-4" />
                      )}

                      Reject
                    </Button>

                    <Button
                      onClick={() =>
                        handleApprove(
                          registration.id,
                        )
                      }
                      disabled={processing}
                    >
                      {processing ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Check className="h-4 w-4" />
                      )}

                      Approve
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
