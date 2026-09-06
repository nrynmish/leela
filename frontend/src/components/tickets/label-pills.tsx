import { Badge } from "@/components/ui/badge";

export function LabelPills({ labels }: { labels: string[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {labels.map((label) => (
        <Badge key={label} variant="secondary" className="rounded-full border-[#303030] bg-[#1A1A1A] text-[#D7D7D7]">
          {label}
        </Badge>
      ))}
    </div>
  );
}