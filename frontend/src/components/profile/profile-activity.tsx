import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import type { ActivityItem } from "@/lib/profile-types";

export function ProfileActivity({
  activity,
}: {
  activity: ActivityItem[];
}) {
  return (
    <Card className="rounded-[20px] border-[#262626] bg-[#141414]">
      <CardHeader>
        <CardTitle className="text-white">
          Recent Activity
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {activity.map((item) => (
          <div
            key={item.id}
            className="border-l border-[#262626] pl-4"
          >
            <p className="text-sm text-white">
              {item.action}
            </p>

            <p className="text-xs text-[#A0A0A0]">
              {item.timestamp}
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}