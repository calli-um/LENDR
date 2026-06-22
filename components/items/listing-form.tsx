"use client";

import Link from "next/link";
import { useActionState, useRef, useState } from "react";
import { createListing, updateListing } from "@/lib/actions/items";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CATEGORIES } from "@/lib/utils";
import type { ItemWithImages } from "@/types/database";

// Per-field error shape returned from the server action
type FieldErrors = {
  title?: string;
  description?: string;
  pricePerDay?: string;
  category?: string;
  location?: string;
  general?: string;
};

type FormState = FieldErrors | null;

export function ListingForm({
  item,
  mode,
}: {
  item?: ItemWithImages;
  mode: "create" | "edit";
}) {
  // Refs to read current field values on submit so we can restore them on error
  const titleRef = useRef<HTMLInputElement>(null);
  const descRef = useRef<HTMLTextAreaElement>(null);
  const priceRef = useRef<HTMLInputElement>(null);
  const categoryRef = useRef<HTMLSelectElement>(null);
  const locationRef = useRef<HTMLInputElement>(null);

  // Snapshot of the last submitted values — used as defaultValue when there's an error
  const [snapshot, setSnapshot] = useState<Record<string, string>>({});

  const action =
    mode === "create"
      ? createListing
      : (prev: unknown, formData: FormData) =>
          updateListing(item!.id, prev, formData);

  const [state, formAction, pending] = useActionState(
    async (_prev: FormState, formData: FormData): Promise<FormState> => {
      // Capture current field values before submitting so we can restore them
      setSnapshot({
        title: titleRef.current?.value ?? "",
        description: descRef.current?.value ?? "",
        pricePerDay: priceRef.current?.value ?? "",
        category: categoryRef.current?.value ?? "",
        location: locationRef.current?.value ?? "",
      });

      if (mode === "edit" && item) {
        formData.set("existingImageCount", String(item.item_images?.length ?? 0));
      }

      const result = await action(_prev, formData);
      return result ?? null;
    },
    null
  );

  // Cast the server error (currently just { error?: string }) into our FieldErrors shape.
  // The server action returns a generic error string; map common messages to specific fields.
  const fieldErrors = parseFieldErrors(state);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{mode === "create" ? "List a new item" : "Edit listing"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          {/* Title */}
          <div className="space-y-1">
            <Label htmlFor="title">Title</Label>
            <Input
              ref={titleRef}
              id="title"
              name="title"
              defaultValue={snapshot.title ?? item?.title}
              placeholder="Min. 3 characters — e.g. 'Canon DSLR Camera'"
              required
              className={fieldErrors.title ? "border-red-400 focus-visible:ring-red-400" : ""}
            />
            {fieldErrors.title && (
              <p className="text-xs text-red-600">{fieldErrors.title}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-1">
            <Label htmlFor="description">Description</Label>
            <Textarea
              ref={descRef}
              id="description"
              name="description"
              defaultValue={snapshot.description ?? item?.description}
              rows={4}
              placeholder="Min. 10 characters — describe condition, included accessories, pickup details, etc."
              required
              className={fieldErrors.description ? "border-red-400 focus-visible:ring-red-400" : ""}
            />
            {fieldErrors.description && (
              <p className="text-xs text-red-600">{fieldErrors.description}</p>
            )}
          </div>

          {/* Price + Category */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <Label htmlFor="pricePerDay">Price per day (PKR)</Label>
              <Input
                ref={priceRef}
                id="pricePerDay"
                name="pricePerDay"
                type="number"
                min="0"
                step="0.01"
                defaultValue={snapshot.pricePerDay ?? item?.price_per_day}
                placeholder="e.g. 500"
                required
                className={fieldErrors.pricePerDay ? "border-red-400 focus-visible:ring-red-400" : ""}
              />
              {fieldErrors.pricePerDay && (
                <p className="text-xs text-red-600">{fieldErrors.pricePerDay}</p>
              )}
            </div>
            <div className="space-y-1">
              <Label htmlFor="category">Category</Label>
              <select
                ref={categoryRef}
                id="category"
                name="category"
                defaultValue={snapshot.category ?? item?.category ?? CATEGORIES[0]}
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

          {/* Location */}
          <div className="space-y-1">
            <Label htmlFor="location">Location</Label>
            <Input
              ref={locationRef}
              id="location"
              name="location"
              defaultValue={snapshot.location ?? item?.location}
              placeholder="City, neighborhood — min. 2 characters"
              required
              className={fieldErrors.location ? "border-red-400 focus-visible:ring-red-400" : ""}
            />
            {fieldErrors.location && (
              <p className="text-xs text-red-600">{fieldErrors.location}</p>
            )}
          </div>

          {/* Images */}
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

          {/* General / unexpected error */}
          {fieldErrors.general && (
            <p className="text-sm text-red-600">{fieldErrors.general}</p>
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

/**
 * Maps the server's error string to per-field errors so we can highlight
 * only the specific field that failed rather than showing a generic banner.
 */
function parseFieldErrors(state: FormState): FieldErrors {
  if (!state) return {};

  // If the action returned per-field errors already (future-proof)
  if (typeof state === "object" && !("error" in state)) return state as FieldErrors;

  const msg: string = (state as { error?: string }).error ?? "";

  if (/title/i.test(msg)) return { title: msg };
  if (/description/i.test(msg)) return { description: msg };
  if (/price/i.test(msg)) return { pricePerDay: msg };
  if (/location/i.test(msg)) return { location: msg };
  if (/category/i.test(msg)) return { category: msg };
  return { general: msg };
}
