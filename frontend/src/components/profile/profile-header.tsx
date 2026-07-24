import { Mail, GraduationCap } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

import type { CompleteProfile } from "@/lib/profile-types";

export function ProfileHeader({
  user,
}: {
  user: CompleteProfile;
}) {
  return (
    <div className="rounded-3xl border bg-card p-8">
      <div className="flex items-start gap-6">
        <Avatar className="h-24 w-24">
          <AvatarFallback className="text-xl">
            {user.full_name
              .split(" ")
              .map((part) => part[0])
              .join("")
              .slice(0, 2)}
          </AvatarFallback>
        </Avatar>

        <div className="space-y-3">
          <div>
            <h1 className="text-3xl font-semibold">
              {user.full_name}
            </h1>

            <p className="text-muted-foreground capitalize">
              {user.role}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {user.skills.map((skill) => (
              <Badge
                key={skill}
                variant="secondary"
              >
                {skill}
              </Badge>
            ))}
          </div>

          <div className="space-y-1 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              {user.email}
            </div>

            <div className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4" />
              {user.roll_no} • {user.department}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}