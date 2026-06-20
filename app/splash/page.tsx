"use client";

import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#f8f9fa] text-[#191c1d] flex flex-col">
      {/* Navbar */}
      <header className="w-full flex items-center justify-between px-6 md:px-10 py-5 bg-white border-b border-[#e7e8e9]">
        <h1 className="text-2xl font-extrabold tracking-tight font-[Manrope] text-[#006c49]">
          LENDR
        </h1>

        <div className="flex gap-3">
          <Link href="/login">
            <button className="px-5 py-2 rounded-md border border-[#006c49] text-[#006c49] font-medium hover:bg-[#f3f4f5] transition">
              Login
            </button>
          </Link>

          <Link href="/signup">
            <button className="px-5 py-2 rounded-md bg-gradient-to-r from-[#006c49] to-[#2170e4] text-white font-semibold hover:brightness-110 transition">
              Sign Up
            </button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-6">
        <div className="max-w-3xl">
          <h2 className="text-4xl md:text-5xl font-extrabold font-[Manrope] leading-tight">
            Rent. Lend. Share.
            <span className="text-[#006c49]"> Smarter.</span>
          </h2>

          <p className="mt-5 text-[#3c4a42] text-lg leading-relaxed">
            A trusted peer-to-peer marketplace built for modern sharing.
            Rent what you need. Lend what you don’t. Earn with confidence.
          </p>

          <div className="mt-8 flex flex-col md:flex-row gap-4 justify-center">
            <Link href="/login">
              <button className="px-7 py-3 rounded-lg bg-gradient-to-r from-[#006c49] to-[#2170e4] text-white font-semibold hover:brightness-110 transition shadow-md">
                Get Started
              </button>
            </Link>

            <Link href="/login">
              <button className="px-7 py-3 rounded-lg border border-[#006c49] text-[#006c49] font-semibold hover:bg-[#f3f4f5] transition">
                I already have an account
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Strip */}
      <section className="bg-white border-t border-[#e7e8e9] px-6 md:px-10 py-12">
        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto text-center">
          <div className="p-6 rounded-lg border border-[#f3f4f6] shadow-sm">
            <h3 className="font-bold text-[#006c49] mb-2">Trusted Users</h3>
            <p className="text-sm text-[#3c4a42]">
              Verified community with trust badges and secure transactions.
            </p>
          </div>

          <div className="p-6 rounded-lg border border-[#f3f4f6] shadow-sm">
            <h3 className="font-bold text-[#006c49] mb-2">Fast Rentals</h3>
            <p className="text-sm text-[#3c4a42]">
              Instantly rent items with smooth checkout and real-time availability.
            </p>
          </div>

          <div className="p-6 rounded-lg border border-[#f3f4f6] shadow-sm">
            <h3 className="font-bold text-[#006c49] mb-2">Earn Money</h3>
            <p className="text-sm text-[#3c4a42]">
              List your unused items and generate passive income.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 md:px-10 py-6 text-center text-sm text-[#6c7a71] border-t border-[#e7e8e9]">
        © {new Date().getFullYear()} Lendr. Built with trust & clarity.
      </footer>
    </main>
  );
}