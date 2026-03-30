"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function RegisterPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setIsError(false);

    try {
      const { error } = await supabase.from("members").insert([
        {
          full_name: form.fullName.trim(),
          email: form.email.trim().toLowerCase(),
          phone: form.phone.trim() || null,
          consent: true,
          is_active: true,
        },
      ]);

      if (error) {
        console.error("Register member error:", {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
        });

        if (error.code === "23505") {
          setIsError(true);
          setMessage("This email is already registered as a member.");
        } else {
          setIsError(true);
          setMessage(error.message || "Failed to register. Please try again.");
        }
        return;
      }

      setIsError(false);
      setMessage("✅ You are now a member!");
      setForm({
        fullName: "",
        email: "",
        phone: "",
      });
    } catch (err) {
      console.error("Register fatal error:", err);
      setIsError(true);
      setMessage("Failed to register. Check Supabase connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col bg-white text-black">
      <Navbar />

      <div className="mx-auto w-full max-w-7xl px-6 pt-6">
        <button
          onClick={() => router.push("/")}
          type="button"
          className="flex items-center gap-2 text-gray-600 transition hover:text-black"
        >
          <ArrowLeft size={22} className="animate-arrow" />
          <span className="font-medium">Back to Home</span>
        </button>
      </div>

      <section className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-xl rounded-3xl border border-gray-200 bg-white p-10 shadow-xl">
          <h1 className="text-center text-3xl font-bold">Become a Member</h1>

          <p className="mt-4 text-center text-gray-600">
            Get notified instantly when new vehicles are added, restocked, or
            when important updates are available.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <input
              type="text"
              name="fullName"
              placeholder="Full Name"
              value={form.fullName}
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
            />

            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
            />

            <input
              type="text"
              name="phone"
              placeholder="Phone Number"
              value={form.phone}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-black px-5 py-3 font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
            >
              {loading ? "Registering..." : "Join Membership"}
            </button>
          </form>

          {message && (
            <p
              className={`mt-6 text-center text-sm ${
                isError ? "text-red-600" : "text-green-600"
              }`}
            >
              {message}
            </p>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}