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
        <Card key={item.label}>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">
              {item.label}
            </p>

            <p className="mt-2 text-3xl font-semibold">
              {item.value}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}