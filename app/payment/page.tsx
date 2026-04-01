"use client";

import { useSearchParams } from "next/navigation";

export default function PaymentPage() {
  const params = useSearchParams();

  const title = params.get("title");
  const price = params.get("price");
  const type = params.get("type");

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-lg rounded-3xl bg-white p-8 shadow">
        <h1 className="text-3xl font-bold text-gray-900">Payment</h1>

        <div className="mt-6 space-y-3">
          <p><strong>Vehicle:</strong> {title}</p>
          <p><strong>Type:</strong> {type}</p>
          <p><strong>Price:</strong> ${price}</p>
        </div>

        <button className="mt-8 w-full rounded-xl bg-black py-3 text-white font-semibold">
          Proceed to Pay
        </button>
      </div>
    </main>
  );
}