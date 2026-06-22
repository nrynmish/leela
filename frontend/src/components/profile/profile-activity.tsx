import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import type { ActivityItem } from "@/lib/profile-types";

export function ProfileActivity({
  activity,
}: {
  activity: ActivityItem[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Recent Activity
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {activity.map((item) => (
          <div
            key={item.id}
            className="border-l pl-4"
          >
            <p className="text-sm">
              {item.action}
            </p>

            <p className="text-xs text-muted-foreground">
              {item.timestamp}
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}