"use client";

import { useActionState } from "react";
import { createReview } from "@/lib/actions/messages";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ReviewStarsInput } from "@/components/profile/review-stars";

export function ReviewForm({
  bookingId,
  revieweeId,
}: {
  bookingId: string;
  revieweeId: string;
}) {
  const [state, formAction, pending] = useActionState(
    createReview.bind(null, bookingId, revieweeId),
    null
  );

  return (
    <div className="rounded-xl border p-4">
      <h2 className="mb-3 text-lg font-semibold">Leave a review</h2>
      <form action={formAction} className="space-y-3">
        <div className="space-y-1">
          <Label htmlFor="rating">Rating</Label>
          <ReviewStarsInput name="rating" />
        </div>
        <div className="space-y-1">
          <Label htmlFor="comment">Comment (optional)</Label>
          <Textarea id="comment" name="comment" rows={3} />
        </div>
        {state?.error && (
          <p className="text-sm text-red-600">{state.error}</p>
        )}
        {state?.success && (
          <p className="text-sm text-emerald-600">Review submitted.</p>
        )}
        <Button type="submit" disabled={pending}>
          {pending ? "Submitting..." : "Submit review"}
        </Button>
      </form>
    </div>
  );
}
