import Link from "next/link";
import { notFound } from "next/navigation";
import { getItem, getItemBookings } from "@/lib/actions/items";
import { getCurrentUser } from "@/lib/actions/auth";
import { isInWishlist } from "@/lib/actions/wishlist";
import { ImageGallery } from "@/components/items/image-gallery";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { VerificationBadge } from "@/components/profile/verification-badge";
import { formatPrice, formatDate } from "@/lib/utils";
import { ItemDetailActions } from "@/components/items/item-detail-actions";
import { deleteListing } from "@/lib/actions/items";
import { Button } from "@/components/ui/button";
import { CalendarX2 } from "lucide-react";

export default async function ItemDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [item, user, saved, bookings] = await Promise.all([
    getItem(id),
    getCurrentUser(),
    isInWishlist(id),
    getItemBookings(id),
  ]);

  if (!item || item.status !== "active") {
    notFound();
  }

  const isOwner = user?.id === item.owner_id;
  const lender = item.profiles;

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <ImageGallery images={item.item_images ?? []} />

      <div className="space-y-6">
        <div>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{item.category}</Badge>
            <span className="text-sm text-gray-500">{item.location}</span>
          </div>
          <h1 className="text-3xl font-bold">{item.title}</h1>
          <p className="mt-4 text-2xl font-semibold text-emerald-700">
            {formatPrice(Number(item.price_per_day))}
            <span className="text-base font-normal text-gray-500">/day</span>
          </p>
        </div>

        <p className="text-gray-700">{item.description}</p>

        {lender && (
          <Link
            href={`/profile/${lender.id}`}
            className="flex items-center gap-3 rounded-xl border p-4 hover:bg-gray-50"
          >
            <Avatar>
              <AvatarImage src={lender.avatar_url ?? undefined} />
              <AvatarFallback>
                {lender.display_name?.[0]?.toUpperCase() ?? "?"}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{lender.display_name}</p>
              <VerificationBadge
                emailVerified={lender.email_verified}
                verifiedLender={lender.verified_lender}
              />
            </div>
          </Link>
        )}

        {/* Booked date slots */}
        {bookings.length > 0 && (
          <div className="rounded-xl border border-orange-100 bg-orange-50 p-4">
            <div className="mb-3 flex items-center gap-2">
              <CalendarX2 className="h-4 w-4 text-orange-500" />
              <h2 className="text-sm font-semibold text-orange-700">
                Booked / Requested Dates
              </h2>
            </div>
            <ul className="space-y-2">
              {bookings.map((b) => (
                <li key={b.id} className="flex items-center justify-between text-sm">
                  <span className="text-gray-700">
                    {formatDate(b.start_date)} – {formatDate(b.end_date)}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      b.status === "confirmed"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-orange-100 text-orange-600"
                    }`}
                  >
                    {b.status === "confirmed" ? "Confirmed" : "Pending"}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {isOwner ? (
          <div className="flex gap-2">
            <Link href={`/listings/${item.id}/edit`}>
              <Button variant="outline">Edit listing</Button>
            </Link>
            <form action={deleteListing.bind(null, item.id)}>
              <Button type="submit" variant="destructive">
                Delete listing
              </Button>
            </form>
          </div>
        ) : (
          <ItemDetailActions itemId={item.id} saved={saved} user={!!user} />
        )}

        <p className="text-sm text-gray-500">
          Payment is arranged offline between you and the lender after booking
          is confirmed.
        </p>
      </div>
    </div>
  );
}
