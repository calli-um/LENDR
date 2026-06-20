import { supabase } from "../supabase.js";

export async function searchListings(keyword) {
  const { data, error } = await supabase
    .from("items")
    .select("*")
    .ilike("title", `%${keyword}%`);

  if (error) throw error;

  return data;
}