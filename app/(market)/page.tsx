import { Suspense } from "react";
import { getItems } from "@/lib/actions/items";
import { ItemGrid } from "@/components/items/item-grid";
import { HomeFilters } from "@/components/items/home-filters";
import { CATEGORIES } from "@/lib/utils";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>;
}) {
  const params = await searchParams;
  const items = await getItems(params.q, params.category);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Rent from your community
        </h1>
        <p className="mt-2 text-gray-600">
          Browse items available to rent nearby. Save favorites and request
          bookings — payment is arranged offline.
        </p>
      </div>

      <Suspense fallback={<div className="h-20 animate-pulse rounded-lg bg-gray-100" />}>
        <HomeFilters
          categories={CATEGORIES}
          currentCategory={params.category ?? "all"}
          currentQuery={params.q ?? ""}
        />
      </Suspense>

      <ItemGrid items={items} />
    </div>
  );
}
