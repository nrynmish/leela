import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

export default function NotificationsPage() {
  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/settings"
          className="inline-flex items-center gap-2 text-sm text-[#A0A0A0] hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Settings
        </Link>

        <h1 className="mt-4 text-3xl font-semibold text-white">
          Notifications
        </h1>

        <p className="mt-2 text-[#A0A0A0]">
          Manage alerts and activity updates.
        </p>
      </div>

      <Card className="rounded-[20px] border-[#262626] bg-[#141414]">
        <CardContent className="p-6 text-[#D7D7D7]">
          Notification preferences will live here.
        </CardContent>
      </Card>
    </div>
  );
}