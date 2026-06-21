"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toggleWishlist } from "@/lib/actions/wishlist";
import { createBooking } from "@/lib/actions/bookings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Heart } from "lucide-react";

export function ItemDetailActions({
  itemId,
  saved,
  user,
}: {
  itemId: string;
  saved: boolean;
  user: boolean;
}) {
  const router = useRouter();
  const [wishlistState, wishlistAction, wishlistPending] = useActionState(
    async () => {
      await toggleWishlist(itemId);
      router.refresh();
      return null;
    },
    null
  );

  const [bookingState, bookingAction, bookingPending] = useActionState(
    createBooking.bind(null, itemId),
    null
  );

  if (!user) {
    return (
      <div className="space-y-4 rounded-xl border p-4">
        <p className="text-sm text-gray-600">
          Log in to save this item or request a booking.
        </p>
        <Link href={`/login?redirect=/items/${itemId}`}>
          <Button className="w-full">Log in</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-xl border p-4">
      <form action={wishlistAction}>
        <Button
          type="submit"
          variant="outline"
          className="w-full gap-2"
          disabled={wishlistPending}
        >
          <Heart className={`h-4 w-4 ${saved ? "fill-red-500 text-red-500" : ""}`} />
          {saved ? "Saved to wishlist" : "Save to wishlist"}
        </Button>
      </form>

      <form action={bookingAction} className="space-y-3">
        <p className="font-medium">Request a booking</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1">
            <Label htmlFor="startDate">Start date</Label>
            <Input id="startDate" name="startDate" type="date" required />
          </div>
          <div className="space-y-1">
            <Label htmlFor="endDate">End date</Label>
            <Input id="endDate" name="endDate" type="date" required />
          </div>
        </div>
        {bookingState?.error && (
          <p className="text-sm text-red-600">{bookingState.error}</p>
        )}
        <Button type="submit" className="w-full" disabled={bookingPending}>
          {bookingPending ? "Submitting..." : "Request booking"}
        </Button>
      </form>
    </div>
  );
}
