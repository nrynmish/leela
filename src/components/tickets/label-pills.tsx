import { Badge } from "@/components/ui/badge";

export function LabelPills({ labels }: { labels: string[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {labels.map((label) => (
        <Badge key={label} variant="secondary" className="rounded-full">
          {label}
        </Badge>
      ))}
    </div>
  );
}