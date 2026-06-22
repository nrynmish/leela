import { DashboardHero } from "@/components/dashboard/dashboard-hero";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { ProjectCards } from "@/components/dashboard/project-cards";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { NotificationsPanel } from "@/components/dashboard/notifications-panel";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <DashboardHero />
      <StatsCards />

      <div className="grid gap-6 xl:grid-cols-[1.5fr_0.9fr]">
        <div className="space-y-6">
          <ProjectCards />
        </div>

        <div className="space-y-6">
          <NotificationsPanel />
          <ActivityFeed />
        </div>
      </div>
    </div>
  );
}