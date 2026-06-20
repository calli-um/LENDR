"use client";

import Link from "next/link";
import { useActionState } from "react";
import { createListing, updateListing } from "@/lib/actions/items";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CATEGORIES } from "@/lib/utils";
import type { ItemWithImages } from "@/types/database";

export function ListingForm({
  item,
  mode,
}: {
  item?: ItemWithImages;
  mode: "create" | "edit";
}) {
  const action =
    mode === "create"
      ? createListing
      : (prev: unknown, formData: FormData) =>
          updateListing(item!.id, prev, formData);

  const [state, formAction, pending] = useActionState(
    async (_prev: { error?: string } | null, formData: FormData) => {
      if (mode === "edit" && item) {
        formData.set("existingImageCount", String(item.item_images?.length ?? 0));
      }
      return (await action(_prev, formData)) ?? null;
    },
    null
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>{mode === "create" ? "List a new item" : "Edit listing"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              name="title"
              defaultValue={item?.title}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={item?.description}
              rows={4}
              required
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="pricePerDay">Price per day ($)</Label>
              <Input
                id="pricePerDay"
                name="pricePerDay"
                type="number"
                min="0"
                step="0.01"
                defaultValue={item?.price_per_day}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <select
                id="category"
                name="category"
                defaultValue={item?.category ?? CATEGORIES[0]}
                className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                required
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              name="location"
              defaultValue={item?.location}
              placeholder="City, neighborhood"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="images">Photos (up to 5)</Label>
            <Input
              id="images"
              name="images"
              type="file"
              accept="image/*"
              multiple
            />
            {mode === "edit" && item?.item_images?.length ? (
              <p className="text-sm text-gray-500">
                {item.item_images.length} existing photo(s). Upload more to add.
              </p>
            ) : null}
          </div>
          {state?.error && (
            <p className="text-sm text-red-600">{state.error}</p>
          )}
          <div className="flex gap-2">
            <Button type="submit" disabled={pending}>
              {pending
                ? "Saving..."
                : mode === "create"
                  ? "Create listing"
                  : "Save changes"}
            </Button>
            <Link href={item ? `/items/${item.id}` : "/"}>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
