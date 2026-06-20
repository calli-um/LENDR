import Link from "next/link";
import Image from "next/image";
import {
  getBookingsAsRenter,
  getBookingsAsLender,
} from "@/lib/actions/bookings";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { BookingStatusBadge } from "@/components/bookings/booking-status-badge";
import { formatDate } from "@/lib/utils";

function BookingCard({
  booking,
  role,
}: {
  booking: {
    id: string;
    start_date: string;
    end_date: string;
    status: string;
    items?: {
      title: string;
      item_images?: { url: string }[];
    } | null;
    renter?: { display_name: string | null } | null;
  };
  role: "renter" | "lender";
}) {
  const imageUrl = booking.items?.item_images?.[0]?.url;

  return (
    <Link href={`/bookings/${booking.id}`}>
      <Card className="transition-shadow hover:shadow-md">
        <CardContent className="flex gap-4 p-4">
          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-gray-100">
            {imageUrl ? (
              <Image src={imageUrl} alt="" fill className="object-cover" />
            ) : null}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold">{booking.items?.title ?? "Item"}</h3>
              <BookingStatusBadge status={booking.status} />
            </div>
            <p className="text-sm text-gray-500">
              {formatDate(booking.start_date)} – {formatDate(booking.end_date)}
            </p>
            {role === "lender" && booking.renter && (
              <p className="text-sm text-gray-600">
                Renter: {booking.renter.display_name}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export default async function BookingsPage() {
  const [asRenter, asLender] = await Promise.all([
    getBookingsAsRenter(),
    getBookingsAsLender(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Bookings</h1>
        <p className="text-gray-600">
          Manage your rental requests and incoming bookings.
        </p>
      </div>

      <Tabs defaultValue="renter">
        <TabsList>
          <TabsTrigger value="renter">
            My requests ({asRenter.length})
          </TabsTrigger>
          <TabsTrigger value="lender">
            Incoming ({asLender.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="renter" className="space-y-3">
          {asRenter.length === 0 ? (
            <EmptyBookings message="You haven't requested any bookings yet." />
          ) : (
            asRenter.map((b) => (
              <BookingCard key={b.id} booking={b} role="renter" />
            ))
          )}
        </TabsContent>

        <TabsContent value="lender" className="space-y-3">
          {asLender.length === 0 ? (
            <EmptyBookings message="No incoming booking requests yet." />
          ) : (
            asLender.map((b) => (
              <BookingCard key={b.id} booking={b} role="lender" />
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function EmptyBookings({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 py-12 text-center">
      <p className="text-gray-600">{message}</p>
      <Link href="/" className="mt-4 inline-block text-emerald-600 hover:underline">
        Browse listings
      </Link>
    </div>
  );
}
