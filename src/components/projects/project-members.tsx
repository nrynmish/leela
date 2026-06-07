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
    <Card>
      <CardHeader>
        <CardTitle>Assigned Members</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {members.map((member) => (
          <div
            key={member.name}
            className="flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarFallback>
                  {member.initials}
                </AvatarFallback>
              </Avatar>

              <div>
                <p className="font-medium">
                  {member.name}
                </p>

                <p className="text-sm text-muted-foreground">
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