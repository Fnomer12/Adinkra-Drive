"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminVerifyPage() {
  const router = useRouter();

  const [code, setCode] = useState("");
  const [adminUserId, setAdminUserId] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const storedAdminUserId = sessionStorage.getItem("adminUserId");
    const storedEmail = sessionStorage.getItem("adminEmail");

    if (!storedAdminUserId) {
      router.push("/admin/login");
      return;
    }

    setAdminUserId(storedAdminUserId);
    setEmail(storedEmail || "");
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/admin/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminUserId, code }),
      });

      const result = await response.json();

      if (!response.ok) {
        setMessage(result.error || "Verification failed.");
        return;
      }

      sessionStorage.removeItem("adminUserId");
      sessionStorage.removeItem("adminUsername");
      sessionStorage.removeItem("adminEmail");

      router.push("/admin");
    } catch (error) {
      console.error("Admin verify page error:", error);
      setMessage("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-bold text-gray-900">Verify Admin</h1>
        <p className="mt-2 text-sm text-gray-500">
          Enter the 6-digit code sent to {email || "your email"}.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            placeholder="6-digit code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full rounded-2xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-black px-5 py-3 font-semibold text-white disabled:opacity-60"
          >
            {loading ? "Verifying..." : "Verify and Login"}
          </button>
        </form>

        {message && (
          <p className="mt-4 text-sm text-red-600">{message}</p>
        )}
      </div>
    </main>
  );
}