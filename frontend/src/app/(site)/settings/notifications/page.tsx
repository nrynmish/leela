import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

export default function NotificationsPage() {
  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/settings"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Settings
        </Link>

        <h1 className="mt-4 text-3xl font-semibold">
          Notifications
        </h1>

        <p className="mt-2 text-muted-foreground">
          Manage alerts and activity updates.
        </p>
      </div>

      <Card>
        <CardContent className="p-6">
          Notification preferences will live here.
        </CardContent>
      </Card>
    </div>
  );
}