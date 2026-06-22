import { ProfileActivity } from "./profile-activity";
import { ProfileHeader } from "./profile-header";
import { ProfileStats } from "./profile-stats";

import type { UserProfile } from "@/lib/profile-types";

export function AdminProfile({
  user,
}: {
  user: UserProfile;
}) {
  return (
    <div className="space-y-6">
      <ProfileHeader user={user} />

      <ProfileStats
        items={[
          {
            label: "Members",
            value: user.adminStats?.totalMembers ?? 0,
          },
          {
            label: "Heads",
            value: user.adminStats?.totalHeads ?? 0,
          },
          {
            label: "Projects",
            value: user.adminStats?.totalProjects ?? 0,
          },
          {
            label: "Open Tickets",
            value: user.adminStats?.openTickets ?? 0,
          },
        ]}
      />

      <ProfileStats
        items={[
          {
            label: "Closed Tickets",
            value: user.adminStats?.closedTickets ?? 0,
          },
        ]}
      />

      <ProfileActivity activity={user.activity} />
    </div>
  );
}