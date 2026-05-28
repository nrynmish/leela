import { Bell } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { notifications } from "@/lib/mock-data";

export function NotificationsPanel() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Bell className="h-4 w-4" />
          Notifications
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {notifications.map((notification) => (
          <div key={notification.id} className="space-y-1 rounded-2xl border p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium">{notification.title}</p>
              {notification.unread ? (
                <Badge className="rounded-full">New</Badge>
              ) : null}
            </div>
            <p className="text-sm text-muted-foreground">{notification.description}</p>
            <p className="text-xs text-muted-foreground">{notification.time}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}