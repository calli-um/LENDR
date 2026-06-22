import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "PKR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(date: string | Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(typeof date === "string" ? new Date(date) : date);
}

export const CATEGORIES = [
  "Electronics",
  "Tools",
  "Sports",
  "Outdoor",
  "Party",
  "Home",
  "Fashion",
  "Other",
] as const;

export type Category = (typeof CATEGORIES)[number];

export const BOOKING_STATUSES = [
  "pending",
  "confirmed",
  "declined",
  "cancelled",
  "completed",
] as const;

export type BookingStatus = (typeof BOOKING_STATUSES)[number];
