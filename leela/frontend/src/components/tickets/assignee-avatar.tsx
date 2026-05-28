import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function AssigneeAvatar({
  name,
  initials,
}: {
  name: string;
  initials: string;
}) {
  return (
    <Avatar className="h-8 w-8 border">
      <AvatarFallback title={name} className="text-[10px] font-medium">
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}