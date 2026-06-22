import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";
import type { ItemWithImages } from "@/types/database";

export function ItemCard({
  item,
  bookingCount = 0,
}: {
  item: ItemWithImages;
  bookingCount?: number;
}) {
  const imageUrl = item.item_images?.[0]?.url;

  return (
    <Link href={`/items/${item.id}`}>
      <Card className="overflow-hidden transition-shadow hover:shadow-md">
        <div className="relative aspect-[4/3] bg-gray-100">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={item.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-gray-400">
              No image
            </div>
          )}
          {bookingCount > 0 && (
            <span className="absolute bottom-2 left-2 rounded-full bg-orange-500 px-2.5 py-0.5 text-xs font-semibold text-white shadow">
              🔖 {bookingCount} booking request{bookingCount !== 1 ? "s" : ""}
            </span>
          )}
        </div>
        <CardContent className="p-4">
          <div className="mb-2 flex items-start justify-between gap-2">
            <h3 className="line-clamp-1 font-semibold">{item.title}</h3>
            <Badge variant="secondary">{item.category}</Badge>
          </div>
          <p className="mb-2 line-clamp-2 text-sm text-gray-500">
            {item.description}
          </p>
          <div className="flex items-center justify-between">
            <span className="font-semibold text-emerald-700">
              {formatPrice(Number(item.price_per_day))}/day
            </span>
            <span className="text-sm text-gray-500">{item.location}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
