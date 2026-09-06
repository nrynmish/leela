import { Badge } from "@/components/ui/badge";
import type { Priority } from "@/lib/types";
import { cn } from "@/lib/utils";

const styles: Record<Priority, string> = {
  low: "border-[#3A3A3A] bg-[#1A1A1A] text-[#D7D7D7]",
  medium: "border-[#2B5A3A] bg-[#162A1D] text-[#A8FFB8]",
  high: "border-[#5C4A1D] bg-[#2A2110] text-[#F7D67A]",
  urgent: "border-[#5F2E2E] bg-[#2B1717] text-[#FF9A9A]",
};

export function PriorityBadge({ priority }: { priority: Priority }) {
  return (
    <Badge variant="outline" className={cn("rounded-full capitalize tracking-[0.12em]", styles[priority])}>
      {priority}
    </Badge>
  );
}