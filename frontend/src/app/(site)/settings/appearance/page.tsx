import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

export default function AppearancePage() {
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
          Appearance
        </h1>

        <p className="mt-2 text-muted-foreground">
          Customize the interface and theme.
        </p>
      </div>

      <Card>
        <CardContent className="p-6">
          Theme, density, and animation preferences will live here.
        </CardContent>
      </Card>
    </div>
  );
}