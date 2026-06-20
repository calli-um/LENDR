import { notFound } from "next/navigation";
import { getItem } from "@/lib/actions/items";
import { getCurrentUser } from "@/lib/actions/auth";
import { ListingForm } from "@/components/items/listing-form";

export default async function EditListingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [item, user] = await Promise.all([getItem(id), getCurrentUser()]);

  if (!item || !user || item.owner_id !== user.id) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-2xl">
      <ListingForm item={item} mode="edit" />
    </div>
  );
}
