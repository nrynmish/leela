import { ProfileActivity } from "./profile-activity";
import { ProfileHeader } from "./profile-header";
import { ProfileStats } from "./profile-stats";

import type { CompleteProfile } from "@/lib/profile-types";

export function AdminProfile({
  user,
}: {
  user: CompleteProfile;
}) {
  return (
    <div className="space-y-6">
      <ProfileHeader user={user} />

      <ProfileStats
        items={[
          {
            label: "Projects",
            value: user.stats.activeProjects,
          },
          {
            label: "Tickets Assigned",
            value: user.stats.ticketsAssigned,
          },
          {
            label: "Tickets Completed",
            value: user.stats.ticketsCompleted,
          },
        ]}
      />

      <ProfileActivity activity={user.activity} />
    </div>
  );
}
