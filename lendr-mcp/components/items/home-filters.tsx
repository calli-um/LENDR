"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/components/ui/cn";

export function HomeFilters({
  categories,
  currentCategory,
  currentQuery,
}: {
  categories: readonly string[];
  currentCategory: string;
  currentQuery: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function updateFilters(updates: Record<string, string>) {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value && value !== "all") {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });
    router.push(`/?${params.toString()}`);
  }

  return (
    <div className="space-y-4">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          updateFilters({ q: formData.get("q")?.toString() ?? "" });
        }}
        className="flex gap-2"
      >
        <Input
          name="q"
          placeholder="Search listings..."
          defaultValue={currentQuery}
          className="max-w-md"
        />
        <Button type="submit">Search</Button>
      </form>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => updateFilters({ category: "all" })}
          className={cn(
            "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
            currentCategory === "all"
              ? "bg-emerald-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          )}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => updateFilters({ category: cat })}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
              currentCategory === cat
                ? "bg-emerald-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            )}
          >
            {cat}
          </button>
        ))}
      </div>
    </div>
  );
}
