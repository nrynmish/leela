import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function ProjectMembers({
  members,
}: {
  members: {
    name: string;
    initials: string;
    role: string;
  }[];
}) {
  return (
    <Card className="rounded-[20px] border-[#262626] bg-[#141414]">
      <CardHeader>
        <CardTitle className="text-white">Assigned Members</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {members.map((member) => (
          <div
            key={member.name}
            className="flex items-center justify-between rounded-[14px] border border-[#262626] bg-[#0D0D0D] px-3 py-2"
          >
            <div className="flex items-center gap-3">
              <Avatar className="border border-[#262626] bg-[#1A1A1A] text-white">
                <AvatarFallback className="text-white">
                  {member.initials}
                </AvatarFallback>
              </Avatar>

              <div>
                <p className="font-medium text-white">
                  {member.name}
                </p>

                <p className="text-sm text-[#A0A0A0]">
                  {member.role}
                </p>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}