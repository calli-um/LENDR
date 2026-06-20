import { ListingForm } from "@/components/items/listing-form";

export default function NewListingPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <ListingForm mode="create" />
    </div>
  );
}
