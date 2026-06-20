import { Badge } from "@/components/ui/badge";
import type { BookingStatus } from "@/lib/utils";

const statusConfig: Record<
  BookingStatus,
  { label: string; variant: "default" | "secondary" | "success" | "warning" | "destructive" }
> = {
  pending: { label: "Pending", variant: "warning" },
  confirmed: { label: "Confirmed", variant: "success" },
  declined: { label: "Declined", variant: "destructive" },
  cancelled: { label: "Cancelled", variant: "secondary" },
  completed: { label: "Completed", variant: "default" },
};

export function BookingStatusBadge({ status }: { status: string }) {
  const config = statusConfig[status as BookingStatus] ?? {
    label: status,
    variant: "secondary" as const,
  };

  return <Badge variant={config.variant}>{config.label}</Badge>;
}
