import { supabase } from "../supabase.js";

export async function getListings(limit = 10) {
  const { data, error } = await supabase
    .from("items")
    .select("*");

  return data;
}

