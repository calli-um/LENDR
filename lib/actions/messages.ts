"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { messageSchema, reviewSchema } from "@/lib/validations";

export async function sendMessage(bookingId: string, formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const parsed = messageSchema.safeParse({
    body: formData.get("body"),
  });

  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Invalid message" };
  }

  const { error } = await supabase.from("messages").insert({
    booking_id: bookingId,
    sender_id: user.id,
    body: parsed.data.body.trim(),
  });

  if (error) return { error: error.message };

  revalidatePath(`/bookings/${bookingId}`);
  return { success: true };
}

export async function getMessages(bookingId: string) {
  const supabase = await createClient();

  const { data } = await supabase
    .from("messages")
    .select("*, sender:profiles!messages_sender_id_fkey(*)")
    .eq("booking_id", bookingId)
    .order("created_at", { ascending: true });

  return data ?? [];
}

export async function createReview(
  bookingId: string,
  revieweeId: string,
  _prev: unknown,
  formData: FormData
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const parsed = reviewSchema.safeParse({
    rating: formData.get("rating"),
    comment: formData.get("comment") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Invalid review" };
  }

  const { error } = await supabase.from("reviews").insert({
    booking_id: bookingId,
    reviewer_id: user.id,
    reviewee_id: revieweeId,
    rating: parsed.data.rating,
    comment: parsed.data.comment ?? null,
  });

  if (error) return { error: error.message };

  revalidatePath(`/profile/${revieweeId}`);
  revalidatePath(`/bookings/${bookingId}`);
  return { success: true };
}

export async function getReviewForBooking(bookingId: string, reviewerId: string) {
  const supabase = await createClient();

  const { data } = await supabase
    .from("reviews")
    .select("*")
    .eq("booking_id", bookingId)
    .eq("reviewer_id", reviewerId)
    .maybeSingle();

  return data;
}
