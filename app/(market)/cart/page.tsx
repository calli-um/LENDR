import Link from "next/link";
import { getWishlist } from "@/lib/actions/wishlist";
import { ItemCard } from "@/components/items/item-card";
import { Button } from "@/components/ui/button";
import { removeFromWishlist } from "@/lib/actions/wishlist";

export default async function CartPage() {
  const wishlist = await getWishlist();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Saved items</h1>
        <p className="text-gray-600">
          Items you&apos;re considering. Request a booking from the item page.
        </p>
      </div>

      {wishlist.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 py-16 text-center">
          <p className="text-lg font-medium text-gray-700">Your wishlist is empty</p>
          <p className="mt-1 text-sm text-gray-500">
            Browse listings and save items you like.
          </p>
          <Link href="/" className="mt-4 inline-block">
            <Button>Browse listings</Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {wishlist.map((entry) => {
            const item = entry.items;
            if (!item) return null;
            return (
              <div key={entry.item_id} className="relative">
                <ItemCard item={{ ...item, item_images: item.item_images ?? [] }} />
                <form
                  action={removeFromWishlist.bind(null, entry.item_id)}
                  className="mt-2"
                >
                  <Button type="submit" variant="outline" size="sm" className="w-full">
                    Remove
                  </Button>
                </form>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
