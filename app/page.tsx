"use client";

import Link from "next/link";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function HomePage() {
  const [videoReady, setVideoReady] = useState(false);

  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />

      <section className="relative min-h-[92vh] overflow-hidden bg-black">
        {!videoReady && (
          <img
            src="/advert-poster.jpg"
            alt="Adinkra Drive hero"
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}

        <video
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster="/advert-poster.jpg"
          onCanPlay={() => setVideoReady(true)}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
            videoReady ? "opacity-100" : "opacity-0"
          }`}
        >
          <source src="/advert.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>

        <div className="absolute inset-0 bg-black/45" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/45 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/10" />

        <div className="relative z-10 mx-auto flex min-h-[92vh] max-w-7xl items-center px-6">
          <div className="max-w-3xl">
            <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm text-gray-100 backdrop-blur-md">
              Trusted mobility for every journey
            </span>

            <h1 className="mt-6 text-5xl font-extrabold leading-tight md:text-7xl">
              Drive in style with{" "}
              <span className="text-yellow-400">Adinkra Drive</span>
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-gray-200 md:text-xl">
              Explore premium vehicles for rent and purchase. Become a member to
              receive live email updates whenever a new car is restocked, added
              to inventory, or when there is important news from Adinkra Drive.
            </p>

            <div className="mt-10">
              <Link
                href="/register"
                className="inline-flex rounded-full bg-yellow-400 px-8 py-4 text-base font-semibold text-black transition duration-300 hover:scale-[1.02] hover:bg-yellow-300"
              >
                Become a Member
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white text-gray-900">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="mb-12 max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">
              Why Join Us
            </p>
            <h2 className="mt-3 text-3xl font-bold md:text-4xl">
              Stay informed and never miss a new arrival
            </h2>
            <p className="mt-4 text-gray-600">
              Adinkra Drive membership keeps you connected with the latest car
              restocks, vehicle availability, and important company updates sent
              directly to your email.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <div className="rounded-3xl border border-gray-200 bg-gray-50 p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg">
              <p className="text-sm font-semibold uppercase tracking-widest text-gray-500">
                Instant Updates
              </p>
              <h3 className="mt-3 text-2xl font-bold">New stock alerts</h3>
              <p className="mt-3 text-gray-600">
                Get notified by email whenever new vehicles are added or
                restocked in our inventory.
              </p>
            </div>

            <div className="rounded-3xl border border-gray-200 bg-gray-50 p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg">
              <p className="text-sm font-semibold uppercase tracking-widest text-gray-500">
                Exclusive Access
              </p>
              <h3 className="mt-3 text-2xl font-bold">Be first to know</h3>
              <p className="mt-3 text-gray-600">
                Members stay ahead with early updates on available cars,
                purchases, rentals, and special announcements.
              </p>
            </div>

            <div className="rounded-3xl border border-gray-200 bg-gray-50 p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg">
              <p className="text-sm font-semibold uppercase tracking-widest text-gray-500">
                Trusted Service
              </p>
              <h3 className="mt-3 text-2xl font-bold">Simple and reliable</h3>
              <p className="mt-3 text-gray-600">
                From updates to bookings, Adinkra Drive keeps the experience
                smooth, premium, and dependable.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="contact" className="bg-gray-50 text-gray-900">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="grid gap-10 md:grid-cols-2">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">
                Contact Us
              </p>
              <h2 className="mt-2 text-3xl font-bold md:text-4xl">
                Let’s get you on the road
              </h2>
              <p className="mt-4 max-w-lg text-gray-600">
                Reach out for rentals, purchases, membership inquiries, fleet
                requests, and special arrangements.
              </p>

              <div className="mt-8 space-y-4 text-gray-700">
                <p>
                  <span className="font-semibold">Phone:</span> +233 (0) 544 239
                  772
                </p>
                <p>
                  <span className="font-semibold">Email:</span>{" "}
                  info@adinkradrive.com
                </p>
                <p>
                  <span className="font-semibold">Location:</span> Accra, Ghana
                </p>
              </div>
            </div>

            <form className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
              <div className="grid gap-4">
                <input
                  type="text"
                  placeholder="Full Name"
                  className="rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-black"
                />
                <input
                  type="email"
                  placeholder="Email Address"
                  className="rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-black"
                />
                <input
                  type="text"
                  placeholder="Phone Number"
                  className="rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-black"
                />
                <textarea
                  placeholder="Tell us what you need..."
                  rows={5}
                  className="rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-black"
                />
                <button
                  type="submit"
                  className="rounded-xl bg-black px-5 py-3 font-semibold text-white transition duration-300 hover:opacity-90"
                >
                  Send Message
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}