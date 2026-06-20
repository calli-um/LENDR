"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { bookingSchema } from "@/lib/validations";

export async function createBooking(itemId: string, _prev: unknown, formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?redirect=/items/" + itemId);

  const parsed = bookingSchema.safeParse({
    startDate: formData.get("startDate"),
    endDate: formData.get("endDate"),
  });

  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Invalid dates" };
  }

  const { data: item } = await supabase
    .from("items")
    .select("owner_id")
    .eq("id", itemId)
    .single();

  if (!item) return { error: "Item not found" };
  if (item.owner_id === user.id) return { error: "You cannot book your own item" };

  const { data: hasOverlap } = await supabase.rpc("check_booking_overlap", {
    p_item_id: itemId,
    p_start_date: parsed.data.startDate,
    p_end_date: parsed.data.endDate,
  });

  if (hasOverlap) {
    return { error: "These dates overlap with an existing confirmed booking" };
  }

  const { data: booking, error } = await supabase
    .from("bookings")
    .insert({
      item_id: itemId,
      renter_id: user.id,
      start_date: parsed.data.startDate,
      end_date: parsed.data.endDate,
      status: "pending",
    })
    .select("id")
    .single();

  if (error || !booking) {
    return { error: error?.message ?? "Failed to create booking" };
  }

  revalidatePath("/bookings");
  redirect(`/bookings/${booking.id}`);
}

export async function updateBookingStatus(
  bookingId: string,
  status: "confirmed" | "declined" | "cancelled" | "completed"
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: booking } = await supabase
    .from("bookings")
    .select("*, items(owner_id)")
    .eq("id", bookingId)
    .single();

  if (!booking) return { error: "Booking not found" };

  const isRenter = booking.renter_id === user.id;
  const isLender =
    booking.items &&
    typeof booking.items === "object" &&
    "owner_id" in booking.items &&
    booking.items.owner_id === user.id;

  if (status === "confirmed" || status === "declined") {
    if (!isLender) return { error: "Only the lender can confirm or decline" };
  }

  if (status === "cancelled" && !isRenter && !isLender) {
    return { error: "Unauthorized" };
  }

  if (status === "completed" && !isLender && !isRenter) {
    return { error: "Unauthorized" };
  }

  if (status === "confirmed") {
    const { data: hasOverlap } = await supabase.rpc("check_booking_overlap", {
      p_item_id: booking.item_id,
      p_start_date: booking.start_date,
      p_end_date: booking.end_date,
      p_exclude_booking_id: bookingId,
    });

    if (hasOverlap) {
      return { error: "Dates conflict with another confirmed booking" };
    }
  }

  const { error } = await supabase
    .from("bookings")
    .update({ status })
    .eq("id", bookingId);

  if (error) return { error: error.message };

  revalidatePath("/bookings");
  revalidatePath(`/bookings/${bookingId}`);
  return { success: true };
}

export async function getBookingsAsRenter() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data } = await supabase
    .from("bookings")
    .select("*, items(*, item_images(*), profiles:profiles!items_owner_id_fkey(*))")
    .eq("renter_id", user.id)
    .order("created_at", { ascending: false });

  return data ?? [];
}

export async function getBookingsAsLender() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data: items } = await supabase
    .from("items")
    .select("id")
    .eq("owner_id", user.id);

  if (!items?.length) return [];

  const itemIds = items.map((i) => i.id);

  const { data } = await supabase
    .from("bookings")
    .select("*, items(*, item_images(*)), renter:profiles!bookings_renter_id_fkey(*)")
    .in("item_id", itemIds)
    .order("created_at", { ascending: false });

  return data ?? [];
}

export async function getBooking(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data } = await supabase
    .from("bookings")
    .select(
      "*, items(*, item_images(*), profiles:profiles!items_owner_id_fkey(*)), renter:profiles!bookings_renter_id_fkey(*)"
    )
    .eq("id", id)
    .single();

  if (!data) return null;

  const isRenter = data.renter_id === user.id;
  const isLender = data.items?.owner_id === user.id;

  if (!isRenter && !isLender) return null;

  return data;
}
