import { Badge } from "@/components/ui/badge";
import type { Priority } from "@/lib/types";
import { cn } from "@/lib/utils";

const styles: Record<Priority, string> = {
  low: "border-slate-500/20 bg-slate-500/10 text-slate-700 dark:text-slate-300",
  medium: "border-blue-500/20 bg-blue-500/10 text-blue-700 dark:text-blue-300",
  high: "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  urgent: "border-rose-500/20 bg-rose-500/10 text-rose-700 dark:text-rose-300",
};

export function PriorityBadge({ priority }: { priority: Priority }) {
  return (
    <Badge variant="outline" className={cn("rounded-full capitalize", styles[priority])}>
      {priority}
    </Badge>
  );
}