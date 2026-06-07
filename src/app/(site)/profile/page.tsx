import { currentUser } from "@/lib/mock-profile";

import { MemberProfile } from "@/components/profile/member-profile";
import { HeadProfile } from "@/components/profile/head-profile";
import { AdminProfile } from "@/components/profile/admin-profile";

export default function ProfilePage() {
  if (currentUser.role === "member") {
    return <MemberProfile user={currentUser} />;
  }

  if (currentUser.role === "head") {
    return <HeadProfile user={currentUser} />;
  }

  return <AdminProfile user={currentUser} />;
}