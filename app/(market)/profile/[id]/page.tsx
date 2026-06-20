import { notFound } from "next/navigation";
import { getProfile } from "@/lib/actions/items";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { VerificationBadge } from "@/components/profile/verification-badge";
import { ReviewStars } from "@/components/profile/review-stars";
import { ItemGrid } from "@/components/items/item-grid";
import { formatDate } from "@/lib/utils";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getProfile(id);

  if (!data) {
    notFound();
  }

  const { profile, items, reviews, avgRating } = data;

  return (
    <div className="space-y-8">
      <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
        <Avatar className="h-20 w-20">
          <AvatarImage src={profile.avatar_url ?? undefined} />
          <AvatarFallback className="text-2xl">
            {profile.display_name?.[0]?.toUpperCase() ?? "?"}
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-2xl font-bold">{profile.display_name}</h1>
          {profile.location && (
            <p className="text-gray-600">{profile.location}</p>
          )}
          {profile.bio && (
            <p className="mt-2 max-w-xl text-gray-700">{profile.bio}</p>
          )}
          <div className="mt-3">
            <VerificationBadge
              emailVerified={profile.email_verified}
              verifiedLender={profile.verified_lender}
            />
          </div>
          {avgRating !== null && (
            <div className="mt-2 flex items-center gap-2">
              <ReviewStars rating={avgRating} size="md" />
              <span className="text-sm text-gray-600">
                {avgRating.toFixed(1)} ({reviews.length} review
                {reviews.length !== 1 ? "s" : ""})
              </span>
            </div>
          )}
        </div>
      </div>

      <section>
        <h2 className="mb-4 text-xl font-semibold">Listings</h2>
        <ItemGrid items={items} />
      </section>

      {reviews.length > 0 && (
        <section>
          <h2 className="mb-4 text-xl font-semibold">Reviews</h2>
          <div className="space-y-4">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="rounded-xl border bg-white p-4"
              >
                <div className="flex items-center justify-between">
                  <p className="font-medium">
                    {review.reviewer?.display_name ?? "Anonymous"}
                  </p>
                  <ReviewStars rating={review.rating} />
                </div>
                {review.comment && (
                  <p className="mt-2 text-gray-700">{review.comment}</p>
                )}
                <p className="mt-2 text-xs text-gray-500">
                  {formatDate(review.created_at)}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
