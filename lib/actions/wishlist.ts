"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function toggleWishlist(itemId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?redirect=/items/" + itemId);

  const { data: existing } = await supabase
    .from("wishlist_items")
    .select("*")
    .eq("user_id", user.id)
    .eq("item_id", itemId)
    .maybeSingle();

  if (existing) {
    await supabase
      .from("wishlist_items")
      .delete()
      .eq("user_id", user.id)
      .eq("item_id", itemId);
  } else {
    await supabase.from("wishlist_items").insert({
      user_id: user.id,
      item_id: itemId,
    });
  }

  revalidatePath("/cart");
  revalidatePath(`/items/${itemId}`);
  return { saved: !existing };
}

export async function removeFromWishlist(itemId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  await supabase
    .from("wishlist_items")
    .delete()
    .eq("user_id", user.id)
    .eq("item_id", itemId);

  revalidatePath("/cart");
}

export async function getWishlist() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data } = await supabase
    .from("wishlist_items")
    .select("*, items(*, item_images(*), profiles:profiles!items_owner_id_fkey(*))")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return data ?? [];
}

export async function getWishlistCount() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return 0;

  const { count } = await supabase
    .from("wishlist_items")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  return count ?? 0;
}

export async function isInWishlist(itemId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return false;

  const { data } = await supabase
    .from("wishlist_items")
    .select("item_id")
    .eq("user_id", user.id)
    .eq("item_id", itemId)
    .maybeSingle();

  return !!data;
}
