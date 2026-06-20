export async function getListings(limit = 10) {
  const { data, error } = await supabase
    .from("items")
    .select("*")
    .eq("status", "available")
    .limit(limit);

  if (error) throw new Error(error.message);

  return data;
}