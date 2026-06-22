import Link from "next/link";
import { Heart, Calendar, Plus, User, Settings } from "lucide-react";
import { LogoutButton } from "@/components/layout/logout-button";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/actions/auth";
import { getWishlistCount } from "@/lib/actions/wishlist";

/** A small wrapper that shows a CSS tooltip on hover — no JS needed. */
function NavIcon({
  href,
  label,
  children,
  extraClass = "",
}: {
  href: string;
  label: string;
  children: React.ReactNode;
  extraClass?: string;
}) {
  return (
    <Link
      href={href}
      className={`group relative rounded-md p-2 hover:bg-gray-100 ${extraClass}`}
      aria-label={label}
    >
      {children}
      {/* Tooltip */}
      <span
        className="
          pointer-events-none absolute -bottom-9 left-1/2 -translate-x-1/2
          whitespace-nowrap rounded-md bg-gray-800 px-2 py-1 text-xs text-white
          opacity-0 shadow-md transition-opacity duration-150
          group-hover:opacity-100
        "
      >
        {label}
      </span>
    </Link>
  );
}

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

              {/* Favourites */}
              <NavIcon href="/cart" label="Favourites" extraClass="relative">
                <Heart className="h-5 w-5" />
                {wishlistCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-xs text-white">
                    {wishlistCount}
                  </span>
                )}
              </NavIcon>

              {/* Bookings */}
              <NavIcon href="/bookings" label="Bookings">
                <Calendar className="h-5 w-5" />
              </NavIcon>

              {/* Profile */}
              <NavIcon href={`/profile/${user.id}`} label="Profile">
                <User className="h-5 w-5" />
              </NavIcon>

              {/* Settings */}
              <NavIcon href="/settings" label="Settings">
                <Settings className="h-5 w-5" />
              </NavIcon>

              {/* Logout */}
              <LogoutButton />
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
