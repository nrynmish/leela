import { Mail, GraduationCap } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";

import type { CompleteProfile } from "@/lib/profile-types";

export function ProfileHeader({
  user,
}: {
  user: CompleteProfile;
}) {
  const initials = user.full_name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2);

  return (
    <div className="rounded-[24px] border border-[#262626] bg-[#141414] p-8">
      <div className="flex items-start gap-6">
        <Avatar className="h-24 w-24 border border-[#262626] bg-[#1A1A1A] text-white">
          <AvatarFallback className="text-xl text-white">
            {initials}
          </AvatarFallback>
        </Avatar>

        <div className="space-y-3">
          <div>
            <h1 className="text-3xl font-semibold text-white">
              {user.full_name}
            </h1>

            <p className="capitalize text-[#A0A0A0]">
              {user.role}
            </p>
          </div>

          <div className="space-y-1 text-sm text-[#A0A0A0]">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-[#CBFF3D]" />
              {user.email}
            </div>

            <div className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-[#CBFF3D]" />
              {user.roll_no} • {user.department}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
