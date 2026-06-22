import Link from "next/link";
import {
  Bell,
  Palette,
  PlugZap,
  Settings2,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

const sections = [
  {
    title: "General",
    description: "Workspace preferences and defaults.",
    href: "/settings",
    icon: Settings2,
  },
  {
    title: "Appearance",
    description: "Theme and interface customization.",
    href: "/settings/appearance",
    icon: Palette,
  },
  {
    title: "Notifications",
    description: "Manage alerts and activity updates.",
    href: "/settings/notifications",
    icon: Bell,
  },
  {
    title: "Integrations",
    description: "Connect external tools and services.",
    href: "/settings/integrations",
    icon: PlugZap,
  },
];

export default function SettingsPage() {
  return (
    <div className="space-y-8">
      <div>

        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          Settings
        </h1>

        <p className="mt-2 text-muted-foreground">
          Configure your Leela workspace.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {sections.map((section) => {
          const Icon = section.icon;

          return (
            <Link
              key={section.href}
              href={section.href}
              className="group"
            >
              <Card className="h-full cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg">
                <CardContent className="flex items-start gap-4 p-6">
                  <div className="rounded-2xl border bg-muted/40 p-3 transition-colors group-hover:bg-primary/10">
                    <Icon className="h-5 w-5" />
                  </div>

                  <div>
                    <h3 className="font-medium">
                      {section.title}
                    </h3>

                    <p className="mt-1 text-sm text-muted-foreground">
                      {section.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
