import { Avatar, AvatarFallback } from "@/components/ui/avatar";

type Member = { name: string; initials: string };

export function AvatarGroup({ members }: { members: Member[] }) {
  return (
    <div className="flex -space-x-2">
      {members.map((member) => (
        <Avatar key={member.name} className="h-8 w-8 border-2 border-background">
          <AvatarFallback className="text-[10px] font-medium">
            {member.initials}
          </AvatarFallback>
        </Avatar>
      ))}
    </div>
  );
}