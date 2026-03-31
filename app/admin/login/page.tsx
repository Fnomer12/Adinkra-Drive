"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    username: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const result = await response.json();

      if (!response.ok) {
        setMessage(result.error || "Login failed.");
        return;
      }

      sessionStorage.setItem("adminUserId", result.adminUserId);
      sessionStorage.setItem("adminUsername", result.username);
      sessionStorage.setItem("adminEmail", result.email);

      router.push("/admin/verify");
    } catch (error) {
      console.error("Admin login page error:", error);
      setMessage("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-bold text-gray-900">Admin Login</h1>
        <p className="mt-2 text-sm text-gray-500">
          Enter your admin username and password.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={form.username}
            onChange={handleChange}
            className="w-full rounded-2xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            className="w-full rounded-2xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-black px-5 py-3 font-semibold text-white disabled:opacity-60"
          >
            {loading ? "Checking..." : "Continue"}
          </button>
        </form>

        {message && (
          <p className="mt-4 text-sm text-red-600">{message}</p>
        )}
      </div>
    </main>
  );
}