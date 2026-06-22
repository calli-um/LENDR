import { ItemCard } from "@/components/items/item-card";
import type { ItemWithImages } from "@/types/database";

type ItemWithCount = ItemWithImages & { booking_count?: number };

export function ItemGrid({ items }: { items: ItemWithCount[] }) {
  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 py-16 text-center">
        <p className="text-lg font-medium text-gray-700">No listings found</p>
        <p className="mt-1 text-sm text-gray-500">
          Try adjusting your search or list something new.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <ItemCard key={item.id} item={item} bookingCount={item.booking_count ?? 0} />
      ))}
    </div>
  );
}
