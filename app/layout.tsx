import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LENDR — Peer-to-Peer Rentals",
  description: "Rent and lend items in your community",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
