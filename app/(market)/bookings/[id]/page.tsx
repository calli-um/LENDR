import Link from "next/link";
import { notFound } from "next/navigation";
import { getBooking } from "@/lib/actions/bookings";
import { getMessages, getReviewForBooking } from "@/lib/actions/messages";
import { getCurrentUser } from "@/lib/actions/auth";
import { BookingStatusBadge } from "@/components/bookings/booking-status-badge";
import { MessageThread } from "@/components/messages/message-thread";
import { ReviewForm } from "@/components/profile/review-form";
import { formatDate, formatPrice } from "@/lib/utils";
import { BookingActions } from "@/components/bookings/booking-actions";

export default async function BookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [booking, user, messages] = await Promise.all([
    getBooking(id),
    getCurrentUser(),
    getMessages(id),
  ]);

  if (!booking || !user) {
    notFound();
  }

  const isRenter = booking.renter_id === user.id;
  const isLender = booking.items?.owner_id === user.id;
  const lender = booking.items?.profiles;
  const revieweeId = isRenter ? lender?.id : booking.renter_id;
  const existingReview = revieweeId
    ? await getReviewForBooking(id, user.id)
    : null;

  const days =
    Math.ceil(
      (new Date(booking.end_date).getTime() -
        new Date(booking.start_date).getTime()) /
        (1000 * 60 * 60 * 24)
    ) || 1;

  const total =
    Number(booking.items?.price_per_day ?? 0) * days;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link
            href={`/items/${booking.item_id}`}
            className="text-sm text-emerald-600 hover:underline"
          >
            {booking.items?.title}
          </Link>
          <h1 className="mt-1 text-2xl font-bold">Booking details</h1>
          <p className="text-gray-600">
            {formatDate(booking.start_date)} – {formatDate(booking.end_date)} (
            {days} day{days !== 1 ? "s" : ""})
          </p>
          <p className="mt-1 font-medium">
            Estimated total: {formatPrice(total)} (paid offline)
          </p>
        </div>
        <BookingStatusBadge status={booking.status} />
      </div>

      <BookingActions
        bookingId={booking.id}
        status={booking.status}
        isRenter={isRenter}
        isLender={isLender}
      />

      <div>
        <h2 className="mb-3 text-lg font-semibold">Messages</h2>
        <p className="mb-3 text-sm text-gray-500">
          Coordinate pickup, return, and offline payment here.
        </p>
        <MessageThread
          bookingId={booking.id}
          initialMessages={messages}
          currentUserId={user.id}
        />
      </div>

      {booking.status === "completed" && revieweeId && !existingReview && (
        <ReviewForm bookingId={booking.id} revieweeId={revieweeId} />
      )}

      {existingReview && (
        <p className="text-sm text-gray-500">You already reviewed this booking.</p>
      )}
    </div>
  );
}
