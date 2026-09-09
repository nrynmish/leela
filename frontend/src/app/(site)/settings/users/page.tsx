"use client";

import { useEffect, useState } from "react";
import {
  Loader2,
  Shield,
  UserCog,
  Users,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  deleteUser,
  getAdminUsers,
  updateUserRole,
} from "@/lib/users";
import { useAuthStore } from "@/store/auth-store";
import type { User, UserRole } from "@/types/auth";

const DEPARTMENTS = [
  "Software",
  "Mechanical",
  "Electrical",
  "Research and Outreach",
];

const ROLE_LABELS: Record<UserRole, string> = {
  member: "Member",
  head: "Head",
  admin: "Admin",
};

function roleBadgeVariant(role: UserRole) {
  if (role === "admin") {
    return "default" as const;
  }

  if (role === "head") {
    return "secondary" as const;
  }

  return "outline" as const;
}

export default function UsersPage() {
  const currentUser = useAuthStore((state) => state.user);

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [selectedRoles, setSelectedRoles] = useState<
    Record<number, UserRole>
  >({});

  const [selectedDepartments, setSelectedDepartments] =
    useState<Record<number, string>>({});

  useEffect(() => {
    if (currentUser?.role !== "admin") {
      setLoading(false);
      return;
    }

    let mounted = true;

    async function loadUsers() {
      try {
        setLoading(true);
        setError(null);

        const data = await getAdminUsers();

        if (!mounted) {
          return;
        }

        setUsers(data);

        const roles: Record<number, UserRole> = {};
        const departments: Record<number, string> = {};

        for (const user of data) {
          roles[user.id] = user.role;
          departments[user.id] = user.department;
        }

        setSelectedRoles(roles);
        setSelectedDepartments(departments);
      } catch (err) {
        if (mounted) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load users",
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    void loadUsers();

    return () => {
      mounted = false;
    };
  }, [currentUser?.role]);

  async function handleSave(user: User) {
    const role = selectedRoles[user.id] ?? user.role;
    const department =
      selectedDepartments[user.id] ?? user.department;

    if (role === "head" && !department.trim()) {
      setError("A department is required for a Head.");
      return;
    }

    try {
      setSavingId(user.id);
      setError(null);

      const updatedUser = await updateUserRole(user.id, {
        role,
        department:
          role === "head"
            ? department.trim()
            : department.trim() || null,
      });

      setUsers((current) =>
        current.map((item) =>
          item.id === updatedUser.id
            ? updatedUser
            : item,
        ),
      );

      setSelectedRoles((current) => ({
        ...current,
        [updatedUser.id]: updatedUser.role,
      }));

      setSelectedDepartments((current) => ({
        ...current,
        [updatedUser.id]: updatedUser.department,
      }));
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update user",
      );
    } finally {
      setSavingId(null);
    }
  }

  async function handleDelete(user: User) {
    if (user.id === currentUser?.id) {
      return;
    }

    const confirmed = window.confirm(
      `Delete user ${user.full_name}? This action cannot be undone.`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setError(null);
      setSavingId(user.id);

      await deleteUser(user.id);

      setUsers((current) =>
        current.filter((item) => item.id !== user.id),
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to delete user",
      );
    } finally {
      setSavingId(null);
    }
  }

  if (currentUser?.role !== "admin") {
    return (
      <div className="rounded-[24px] border border-[#262626] bg-[#0D0D0D] p-8">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 text-red-400">
          <Shield className="h-5 w-5" />
        </div>

        <h1 className="mt-5 text-2xl font-bold text-white">
          Access denied
        </h1>

        <p className="mt-2 text-[#A0A0A0]">
          Only administrators can manage users and roles.
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

        <div className="mt-2 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-[color-mix(in_srgb,var(--accent-color)_10%,transparent)] text-[var(--accent-color)]">
            <UserCog className="h-5 w-5" />
          </div>

          <h1 className="text-3xl font-bold text-white">
            User Management
          </h1>
        </div>

        <p className="mt-2 text-[#A0A0A0]">
          Manage user roles, departments, and access.
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <Card className="rounded-[24px] border-[#262626] bg-[#0D0D0D]">
        <CardHeader className="border-b border-[#262626]">
          <div className="flex items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-4 w-4 text-[var(--accent-color)]" />
                Workspace Users
              </CardTitle>

              <p className="mt-1 text-sm text-[#707070]">
                {users.length} registered user
                {users.length === 1 ? "" : "s"}
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center p-12">
              <Loader2 className="h-5 w-5 animate-spin text-[var(--accent-color)]" />
            </div>
          ) : users.length === 0 ? (
            <div className="p-12 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#171717] text-[#707070]">
                <Users className="h-5 w-5" />
              </div>

              <h2 className="mt-4 text-lg font-semibold text-white">
                No users found
              </h2>

              <p className="mt-2 text-sm text-[#707070]">
                Registered users will appear here.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-sm">
                <thead>
                  <tr className="border-b border-[#262626] text-left">
                    <th className="px-6 py-4 font-medium text-[#707070]">
                      User
                    </th>

                    <th className="px-6 py-4 font-medium text-[#707070]">
                      Roll No.
                    </th>

                    <th className="px-6 py-4 font-medium text-[#707070]">
                      Status
                    </th>

                    <th className="px-6 py-4 font-medium text-[#707070]">
                      Role
                    </th>

                    <th className="px-6 py-4 font-medium text-[#707070]">
                      Department
                    </th>

                    <th className="px-6 py-4 text-right font-medium text-[#707070]">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {users.map((user) => {
                    const role =
                      selectedRoles[user.id] ?? user.role;

                    const department =
                      selectedDepartments[user.id] ??
                      user.department;

                    const saving = savingId === user.id;

                    const changed =
                      role !== user.role ||
                      department !== user.department;

                    const isSelf =
                      user.id === currentUser.id;

                    return (
                      <tr
                        key={user.id}
                        className="border-b border-[#262626] last:border-0"
                      >
                        <td className="px-6 py-5">
                          <div>
                            <p className="font-medium text-white">
                              {user.full_name}
                            </p>

                            <p className="mt-1 text-xs text-[#707070]">
                              {user.email}
                            </p>
                          </div>
                        </td>

                        <td className="px-6 py-5 text-[#D7D7D7]">
                          {user.roll_no}
                        </td>

                        <td className="px-6 py-5">
                          <Badge
                            variant={
                              user.status === "approved"
                                ? "secondary"
                                : user.status === "pending"
                                  ? "outline"
                                  : "destructive"
                            }
                          >
                            {user.status}
                          </Badge>
                        </td>

                        <td className="px-6 py-5">
                          <Select
                            value={role}
                            onValueChange={(value) =>
                              setSelectedRoles((current) => ({
                                ...current,
                                [user.id]:
                                  value as UserRole,
                              }))
                            }
                            disabled={
                              saving ||
                              (isSelf &&
                                user.role === "admin")
                            }
                          >
                            <SelectTrigger className="w-[140px]">
                              <SelectValue>
                                {ROLE_LABELS[role]}
                              </SelectValue>
                            </SelectTrigger>

                            <SelectContent>
                              <SelectItem value="member">
                                Member
                              </SelectItem>

                              <SelectItem value="head">
                                Head
                              </SelectItem>

                              <SelectItem value="admin">
                                Admin
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </td>

                        <td className="px-6 py-5">
                          <Select
                            value={department}
                            onValueChange={(value) => {
                              if (value === null) {
                                return;
                              }

                              setSelectedDepartments(
                                (current) => ({
                                  ...current,
                                  [user.id]: value,
                                }),
                              );
                            }}
                            disabled={saving}
                          >
                            <SelectTrigger className="w-[210px]">
                              <SelectValue>
                                {department || "Select department"}
                              </SelectValue>
                            </SelectTrigger>

                            <SelectContent>
                              {DEPARTMENTS.map((departmentOption) => (
                                <SelectItem
                                  key={departmentOption}
                                  value={departmentOption}
                                >
                                  {departmentOption}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </td>

                        <td className="px-6 py-5 text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              disabled={
                                saving ||
                                !changed ||
                                (isSelf &&
                                  user.role === "admin" &&
                                  role !== "admin")
                              }
                              onClick={() =>
                                handleSave(user)
                              }
                            >
                              {saving ? (
                                <>
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                  Saving
                                </>
                              ) : (
                                "Edit"
                              )}
                            </Button>

                            {!isSelf && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-red-500/20 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                                disabled={saving}
                                onClick={() =>
                                  handleDelete(user)
                                }
                              >
                                Delete
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
