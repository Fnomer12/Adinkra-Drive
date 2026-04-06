"use client";

export const dynamic = "force-dynamic"; // ✅ ADD THIS

import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

function VerifyPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const username = searchParams.get("username") || "";
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const response = await fetch("/api/admin/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, code }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error || "Invalid verification code.");
        return;
      }

      router.push("/ADmin00");
    } catch (error) {
      console.error("Admin verify submit error:", error);
      setMessage("Could not verify code.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-sm">
        <h1 className="text-4xl font-bold text-gray-900">Verify Login</h1>

        <form onSubmit={handleVerify} className="mt-8 space-y-4">
          <input
            type="text"
            placeholder="Verification code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full rounded-2xl border px-4 py-4"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-black py-4 text-white"
          >
            {loading ? "Verifying..." : "Verify"}
          </button>
        </form>

        {message && <p className="mt-4 text-red-600">{message}</p>}
      </div>
    </main>
  );
}

export default function AdminVerifyPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyPageContent />
    </Suspense>
  );
}