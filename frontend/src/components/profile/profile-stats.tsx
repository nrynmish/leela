import { Card, CardContent } from "@/components/ui/card";

export function ProfileStats({
  items,
}: {
  items: {
    label: string;
    value: number;
  }[];
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <Card key={item.label} className="rounded-[20px] border-[#262626] bg-[#141414]">
          <CardContent className="p-6">
            <p className="text-sm text-[#A0A0A0]">
              {item.label}
            </p>

            <p className="mt-2 text-3xl font-semibold text-white">
              {item.value}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}