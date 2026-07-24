"use client";

import { useAuthStore } from "@/store/auth-store";

import { profileExtras } from "@/lib/profile-extras";

import { MemberProfile } from "@/components/profile/member-profile";
import { HeadProfile } from "@/components/profile/head-profile";
import { AdminProfile } from "@/components/profile/admin-profile";

export default function ProfilePage() {
  const authUser = useAuthStore(
    (state) => state.user,
  );

  if (!authUser) {
    return null;
  }

  const user = {
    ...authUser,
    ...profileExtras,
  };

  if (user.role === "MEMBER") {
    return <MemberProfile user={user} />;
  }

  if (user.role === "HEAD") {
    return <HeadProfile user={user} />;
  }

  return <AdminProfile user={user} />;
}