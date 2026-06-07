import { ProfileActivity } from "./profile-activity";
import { ProfileHeader } from "./profile-header";
import { ProfileStats } from "./profile-stats";

import type { UserProfile } from "@/lib/profile-types";

export function HeadProfile({
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
            label: "Tickets Assigned",
            value: user.stats.ticketsAssigned,
          },
          {
            label: "Tickets Completed",
            value: user.stats.ticketsCompleted,
          },
          {
            label: "Active Projects",
            value: user.stats.activeProjects,
          },
          {
            label: "Members Managed",
            value: user.headStats?.membersManaged ?? 0,
          },
        ]}
      />

      <ProfileStats
        items={[
          {
            label: "Assigned By Me",
            value: user.headStats?.ticketsAssignedByMe ?? 0,
          },
          {
            label: "Team Tickets Closed",
            value: user.headStats?.teamTicketsClosed ?? 0,
          },
        ]}
      />

      <ProfileActivity activity={user.activity} />
    </div>
  );
}