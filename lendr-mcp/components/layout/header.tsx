import Link from "next/link";
import {
  Heart,
  Calendar,
  Plus,
  LogOut,
  User,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/actions/auth";
import { getWishlistCount } from "@/lib/actions/wishlist";
import { logout } from "@/lib/actions/auth";

export async function Header() {
  const user = await getCurrentUser();
  const wishlistCount = user ? await getWishlistCount() : 0;

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="text-xl font-bold text-emerald-700">
          LENDR
        </Link>

        <nav className="flex items-center gap-2 sm:gap-4">
          {user ? (
            <>
              <Link href="/listings/new">
                <Button variant="outline" size="sm" className="gap-1">
                  <Plus className="h-4 w-4" />
                  <span className="hidden sm:inline">List item</span>
                </Button>
              </Link>
              <Link
                href="/cart"
                className="relative rounded-md p-2 hover:bg-gray-100"
              >
                <Heart className="h-5 w-5" />
                {wishlistCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-xs text-white">
                    {wishlistCount}
                  </span>
                )}
              </Link>
              <Link
                href="/bookings"
                className="rounded-md p-2 hover:bg-gray-100"
              >
                <Calendar className="h-5 w-5" />
              </Link>
              <Link
                href={`/profile/${user.id}`}
                className="rounded-md p-2 hover:bg-gray-100"
              >
                <User className="h-5 w-5" />
              </Link>
              <Link href="/settings" className="rounded-md p-2 hover:bg-gray-100">
                <Settings className="h-5 w-5" />
              </Link>
              <form action={logout}>
                <Button variant="ghost" size="icon" type="submit">
                  <LogOut className="h-5 w-5" />
                </Button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost">Log in</Button>
              </Link>
              <Link href="/signup">
                <Button>Sign up</Button>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
