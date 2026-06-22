"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { listingSchema, profileSchema } from "@/lib/validations";

export async function createListing(_prev: unknown, formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const parsed = listingSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    pricePerDay: formData.get("pricePerDay"),
    category: formData.get("category"),
    location: formData.get("location"),
  });

  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Invalid input" };
  }

  const { data: item, error } = await supabase
    .from("items")
    .insert({
      owner_id: user.id,
      title: parsed.data.title,
      description: parsed.data.description,
      price_per_day: parsed.data.pricePerDay,
      category: parsed.data.category,
      location: parsed.data.location,
    })
    .select("id")
    .single();

  if (error || !item) {
    return { error: error?.message ?? "Failed to create listing" };
  }

  const images = formData.getAll("images") as File[];
  for (let i = 0; i < Math.min(images.length, 5); i++) {
    const file = images[i];
    if (!file || file.size === 0) continue;

    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `${user.id}/${item.id}/${Date.now()}-${i}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("item-images")
      .upload(path, file);

    if (uploadError) continue;

    const {
      data: { publicUrl },
    } = supabase.storage.from("item-images").getPublicUrl(path);

    await supabase.from("item_images").insert({
      item_id: item.id,
      url: publicUrl,
      sort_order: i,
    });
  }

  revalidatePath("/");
  redirect(`/items/${item.id}`);
}

export async function updateListing(itemId: string, _prev: unknown, formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const parsed = listingSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    pricePerDay: formData.get("pricePerDay"),
    category: formData.get("category"),
    location: formData.get("location"),
  });

  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Invalid input" };
  }

  const { error } = await supabase
    .from("items")
    .update({
      title: parsed.data.title,
      description: parsed.data.description,
      price_per_day: parsed.data.pricePerDay,
      category: parsed.data.category,
      location: parsed.data.location,
    })
    .eq("id", itemId)
    .eq("owner_id", user.id);

  if (error) {
    return { error: error.message };
  }

  const images = formData.getAll("images") as File[];
  const existingCount = Number(formData.get("existingImageCount") ?? 0);

  for (let i = 0; i < Math.min(images.length, 5 - existingCount); i++) {
    const file = images[i];
    if (!file || file.size === 0) continue;

    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `${user.id}/${itemId}/${Date.now()}-${i}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("item-images")
      .upload(path, file);

    if (uploadError) continue;

    const {
      data: { publicUrl },
    } = supabase.storage.from("item-images").getPublicUrl(path);

    await supabase.from("item_images").insert({
      item_id: itemId,
      url: publicUrl,
      sort_order: existingCount + i,
    });
  }

  revalidatePath(`/items/${itemId}`);
  redirect(`/items/${itemId}`);
}

export async function deleteListing(itemId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  await supabase
    .from("items")
    .delete()
    .eq("id", itemId)
    .eq("owner_id", user.id);

  revalidatePath("/");
  redirect("/");
}

export async function getItems(search?: string, category?: string) {
  const supabase = await createClient();
  let query = supabase
    .from("items")
    .select("*, item_images(*), profiles:profiles!items_owner_id_fkey(*)")
    .eq("status", "active")
    .order("created_at", { ascending: false });

  if (category && category !== "all") {
    query = query.eq("category", category);
  }

  if (search) {
    query = query.or(
      `title.ilike.%${search}%,description.ilike.%${search}%,location.ilike.%${search}%`
    );
  }

  const { data, error } = await query;
  if (error) return [];
  return data ?? [];
}

export async function getItemsWithBookingCounts(search?: string, category?: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let query = supabase
    .from("items")
    .select("*, item_images(*), profiles:profiles!items_owner_id_fkey(*), bookings(id)")
    .eq("status", "active")
    .order("created_at", { ascending: false });

  // Hide the signed-in user's own listings from their feed
  if (user) {
    query = query.neq("owner_id", user.id);
  }

  if (category && category !== "all") {
    query = query.eq("category", category);
  }

  if (search) {
    query = query.or(
      `title.ilike.%${search}%,description.ilike.%${search}%,location.ilike.%${search}%`
    );
  }

  const { data, error } = await query;
  if (error) return [];
  return (data ?? []).map((item) => ({
    ...item,
    booking_count: Array.isArray(item.bookings) ? item.bookings.length : 0,
  }));
}

export async function getItemBookings(itemId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("bookings")
    .select("id, start_date, end_date, status")
    .eq("item_id", itemId)
    .in("status", ["pending", "confirmed"])
    .order("start_date", { ascending: true });

  if (error) return [];
  return data ?? [];
}

export async function getItem(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("items")
    .select("*, item_images(*), profiles:profiles!items_owner_id_fkey(*)")
    .eq("id", id)
    .single();

  if (error) return null;
  return data;
}

export async function updateProfile(_prev: unknown, formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const parsed = profileSchema.safeParse({
    displayName: formData.get("displayName"),
    bio: formData.get("bio") || undefined,
    location: formData.get("location") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Invalid input" };
  }

  let avatarUrl: string | undefined;

  const avatar = formData.get("avatar") as File | null;
  if (avatar && avatar.size > 0) {
    const ext = avatar.name.split(".").pop() ?? "jpg";
    const path = `${user.id}/avatar.${ext}`;

    await supabase.storage.from("item-images").upload(path, avatar, {
      upsert: true,
    });

    const {
      data: { publicUrl },
    } = supabase.storage.from("item-images").getPublicUrl(path);

    avatarUrl = publicUrl;
  }

  const updateData: Record<string, string | null> = {
    display_name: parsed.data.displayName,
    bio: parsed.data.bio ?? null,
    location: parsed.data.location ?? null,
  };

  if (avatarUrl) {
    updateData.avatar_url = avatarUrl;
  }

  const { error } = await supabase
    .from("profiles")
    .update(updateData)
    .eq("id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/settings");
  revalidatePath(`/profile/${user.id}`);
  return { success: true };
}

export async function getProfile(id: string) {
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .single();

  if (!profile) return null;

  const { data: items } = await supabase
    .from("items")
    .select("*, item_images(*)")
    .eq("owner_id", id)
    .eq("status", "active")
    .order("created_at", { ascending: false });

  const { data: reviews } = await supabase
    .from("reviews")
    .select("*, reviewer:profiles!reviews_reviewer_id_fkey(*)")
    .eq("reviewee_id", id)
    .order("created_at", { ascending: false });

  const avgRating =
    reviews && reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : null;

  return { profile, items: items ?? [], reviews: reviews ?? [], avgRating };
}
