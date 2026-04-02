"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

declare global {
  interface Window {
    PaystackPop?: {
      setup: (options: {
        key: string | undefined;
        email: string;
        amount: number;
        currency?: string;
        ref: string;
        callback: (response: { reference: string }) => void;
        onClose: () => void;
      }) => {
        openIframe: () => void;
      };
    };
  }
}

export default function PaymentPage() {
  const params = useSearchParams();

  const bookingId = params.get("bookingId") || "";
  const title = params.get("title") || "";
  const price = params.get("price") || "0";
  const type = params.get("type") || "";
  const email = params.get("email") || "customer@email.com";

  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const existingScript = document.querySelector(
      'script[src="https://js.paystack.co/v1/inline.js"]'
    ) as HTMLScriptElement | null;

    if (existingScript) {
      setScriptLoaded(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://js.paystack.co/v1/inline.js";
    script.async = true;
    script.onload = () => setScriptLoaded(true);
    script.onerror = () => {
      setMessage("Failed to load payment gateway.");
      setScriptLoaded(false);
    };

    document.body.appendChild(script);

    return () => {
      script.onload = null;
      script.onerror = null;
    };
  }, []);

  function handlePay() {
    if (!bookingId) {
      setMessage("Missing booking ID.");
      return;
    }

    if (!scriptLoaded || !window.PaystackPop) {
      setMessage("Payment gateway is not ready yet.");
      return;
    }

    const amount = Number(price);

    if (!Number.isFinite(amount) || amount <= 0) {
      setMessage("Invalid payment amount.");
      return;
    }

    setMessage("");

    const paystack = window.PaystackPop.setup({
      key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
      email,
      amount: Math.round(amount * 100),
      currency: "GHS",
      ref: `${Date.now()}-${bookingId}`,
    callback: async function (response: { reference: string }) {
  setVerifying(true);
  setMessage("");

  try {
    const res = await fetch("/api/payments/verify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        bookingId,
        reference: response.reference,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setVerified(false);
      setMessage(data.error || "Payment verification failed.");
      return;
    }

    setVerified(true);
    setMessage("Payment verified successfully.");
  } catch (error) {
    console.error("Verification error:", error);
    setVerified(false);
    setMessage("Something went wrong while verifying payment.");
  } finally {
    setVerifying(false);
  }
},
      onClose: function () {
        setMessage("Payment window closed.");
      },
    });

    paystack.openIframe();
  }

  return (
    <main className="min-h-screen bg-gray-100 px-4 py-10">
      <div className="mx-auto w-full max-w-lg rounded-3xl bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-bold text-gray-900">Payment</h1>

        <div className="mt-6 space-y-3 rounded-2xl bg-gray-50 p-5 text-sm text-gray-700">
          <p>
            <strong>Vehicle:</strong> {title || "-"}
          </p>
          <p>
            <strong>Type:</strong> {type || "-"}
          </p>
          <p>
            <strong>Booking ID:</strong> {bookingId || "-"}
          </p>
          <p>
            <strong>Email:</strong> {email}
          </p>
          <p>
            <strong>Price:</strong> GHS {Number(price || 0).toLocaleString()}
          </p>
        </div>

        {message && (
          <div
            className={`mt-5 rounded-2xl px-4 py-3 text-sm ${
              verified
                ? "bg-green-50 text-green-700"
                : "bg-red-50 text-red-600"
            }`}
          >
            {message}
          </div>
        )}

        {verifying && (
          <div className="mt-5 rounded-2xl bg-blue-50 px-4 py-3 text-sm text-blue-700">
            Verifying payment...
          </div>
        )}

        <button
          onClick={handlePay}
          disabled={!scriptLoaded || verifying || verified}
          className="mt-8 w-full rounded-2xl bg-black py-3 font-semibold text-white disabled:opacity-60"
        >
          {verified
            ? "Payment Confirmed"
            : verifying
            ? "Verifying..."
            : "Proceed to Pay"}
        </button>
      </div>
    </main>
  );
}