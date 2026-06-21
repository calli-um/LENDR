import { Star } from "lucide-react";
import { cn } from "@/components/ui/cn";

export function ReviewStars({
  rating,
  size = "sm",
}: {
  rating: number;
  size?: "sm" | "md";
}) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            size === "sm" ? "h-4 w-4" : "h-5 w-5",
            i < Math.round(rating)
              ? "fill-yellow-400 text-yellow-400"
              : "text-gray-300"
          )}
        />
      ))}
    </div>
  );
}

export function ReviewStarsInput({
  name,
  defaultValue,
}: {
  name: string;
  defaultValue?: number;
}) {
  return (
    <select
      name={name}
      defaultValue={defaultValue ?? 5}
      className="rounded-md border border-gray-300 px-3 py-2 text-sm"
    >
      {[5, 4, 3, 2, 1].map((n) => (
        <option key={n} value={n}>
          {n} star{n !== 1 ? "s" : ""}
        </option>
      ))}
    </select>
  );
}
