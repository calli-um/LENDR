"use client";

import { useState } from "react";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { logout } from "@/lib/actions/auth";

export function LogoutButton() {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);

  async function handleConfirm() {
    setPending(true);
    await logout();
  }

  return (
    <>
      {/* Trigger */}
      <div className="group relative">
        <Button
          variant="ghost"
          size="icon"
          aria-label="Log out"
          onClick={() => setOpen(true)}
        >
          <LogOut className="h-5 w-5" />
        </Button>
        <span
          className="
            pointer-events-none absolute -bottom-9 left-1/2 -translate-x-1/2
            whitespace-nowrap rounded-md bg-gray-800 px-2 py-1 text-xs text-white
            opacity-0 shadow-md transition-opacity duration-150
            group-hover:opacity-100
          "
        >
          Log out
        </span>
      </div>

      {/* Confirmation dialog backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={() => !pending && setOpen(false)}
        >
          <div
            className="mx-4 w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-1 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                <LogOut className="h-5 w-5 text-red-600" />
              </span>
              <h2 className="text-lg font-semibold text-gray-900">Log out?</h2>
            </div>
            <p className="mb-6 ml-[52px] text-sm text-gray-500">
              Are you sure you want to log out of your account?
            </p>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={pending}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleConfirm}
                disabled={pending}
              >
                {pending ? "Logging out…" : "Log out"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
