"use client";

import { useRouter } from "next/navigation";
import { updateBookingStatus } from "@/lib/actions/bookings";
import { Button } from "@/components/ui/button";

export function BookingActions({
  bookingId,
  status,
  isRenter,
  isLender,
}: {
  bookingId: string;
  status: string;
  isRenter: boolean;
  isLender: boolean;
}) {
  const router = useRouter();

  async function handleStatus(
    newStatus: "confirmed" | "declined" | "cancelled" | "completed"
  ) {
    const result = await updateBookingStatus(bookingId, newStatus);
    if (result?.error) {
      alert(result.error);
      return;
    }
    router.refresh();
  }

  if (status === "pending" && isLender) {
    return (
      <div className="flex gap-2">
        <Button onClick={() => handleStatus("confirmed")}>Accept</Button>
        <Button variant="destructive" onClick={() => handleStatus("declined")}>
          Decline
        </Button>
      </div>
    );
  }

  if ((status === "pending" || status === "confirmed") && (isRenter || isLender)) {
    return (
      <div className="flex gap-2">
        {status === "confirmed" && (
          <Button variant="outline" onClick={() => handleStatus("completed")}>
            Mark completed
          </Button>
        )}
        <Button variant="destructive" onClick={() => handleStatus("cancelled")}>
          Cancel booking
        </Button>
      </div>
    );
  }

  return null;
}
