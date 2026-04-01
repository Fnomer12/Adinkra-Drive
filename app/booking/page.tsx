"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";

function normalizeDate(date: string) {
  return new Date(`${date}T00:00:00`);
}

function toIsoFromInput(value: string) {
  if (!value) return "";

  if (value.includes("-")) {
    return value;
  }

  const parts = value.split("/");
  if (parts.length !== 3) return "";

  const [mm, dd, yyyy] = parts;
  if (!mm || !dd || !yyyy || yyyy.length !== 4) return "";

  const month = mm.padStart(2, "0");
  const day = dd.padStart(2, "0");

  return `${yyyy}-${month}-${day}`;
}

function toDisplayFromIso(value: string) {
  if (!value) return "";
  const [yyyy, mm, dd] = value.split("-");
  if (!yyyy || !mm || !dd) return "";
  return `${mm}/${dd}/${yyyy}`;
}

function dateDiffInDays(startIso: string, endIso: string) {
  const startDate = normalizeDate(startIso);
  const endDate = normalizeDate(endIso);
  const ms = endDate.getTime() - startDate.getTime();
  return Math.ceil(ms / (1000 * 60 * 60 * 24)) + 1;
}

function rangesOverlap(
  startA: string,
  endA: string,
  startB: string,
  endB: string
) {
  const aStart = normalizeDate(startA).getTime();
  const aEnd = normalizeDate(endA).getTime();
  const bStart = normalizeDate(startB).getTime();
  const bEnd = normalizeDate(endB).getTime();

  return aStart <= bEnd && aEnd >= bStart;
}

type BlockedBooking = {
  id: string;
  start_date: string;
  end_date: string;
  status: string;
};

type CountryOption = {
  name: string;
  code: string;
  flag: string;
};

const countries: CountryOption[] = [
  { name: "Ghana", code: "GH", flag: "🇬🇭" },
  { name: "Nigeria", code: "NG", flag: "🇳🇬" },
  { name: "United States", code: "US", flag: "🇺🇸" },
  { name: "United Kingdom", code: "GB", flag: "🇬🇧" },
  { name: "Canada", code: "CA", flag: "🇨🇦" },
  { name: "South Africa", code: "ZA", flag: "🇿🇦" },
  { name: "Kenya", code: "KE", flag: "🇰🇪" },
  { name: "Germany", code: "DE", flag: "🇩🇪" },
  { name: "France", code: "FR", flag: "🇫🇷" },
  { name: "Spain", code: "ES", flag: "🇪🇸" },
  { name: "Italy", code: "IT", flag: "🇮🇹" },
  { name: "India", code: "IN", flag: "🇮🇳" },
];

type Chauffeur = {
  id: string;
  name: string;
  phone: string;
  image: string;
};

const chauffeurs: Chauffeur[] = [
  {
    id: "ch-1",
    name: "Kwame Mensah",
    phone: "+233 24 123 4567",
    image: "/chauffeurs/kwame.jpg",
  },
];

export default function BookingPage() {
    const [showCalendar, setShowCalendar] = useState<"start" | "end" | null>(null);
  const router = useRouter();
  const params = useSearchParams();

  const vehicleId = params.get("vehicleId") || "";
  const title = params.get("title") || "";
  const price = Number(params.get("price") || 0);
  const type = params.get("type") || "rent";

  const [blockedBookings, setBlockedBookings] = useState<BlockedBooking[]>([]);
  const [blockedDatesLoading, setBlockedDatesLoading] = useState(false);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [startDateInput, setStartDateInput] = useState("");
  const [endDateInput, setEndDateInput] = useState("");

  const [pickupLocation, setPickupLocation] = useState("");
  const [chauffeurRequired, setChauffeurRequired] = useState(false);
  const [selectedChauffeur] = useState<Chauffeur>(chauffeurs[0]);
  const [countryOfBirth, setCountryOfBirth] = useState("");
  const [handoverDocument, setHandoverDocument] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const startDate = useMemo(() => toIsoFromInput(startDateInput), [startDateInput]);
  const endDate = useMemo(() => toIsoFromInput(endDateInput), [endDateInput]);

  useEffect(() => {
    async function loadBlockedBookings() {
      if (!vehicleId || type !== "rent") return;

      setBlockedDatesLoading(true);

      try {
        const response = await fetch(
          `/api/bookings/by-vehicle?vehicleId=${encodeURIComponent(vehicleId)}`
        );
        const data = await response.json();

        if (!response.ok) {
          console.error("Blocked bookings fetch failed:", data);
          return;
        }

        setBlockedBookings(data.bookings || []);
      } catch (error) {
        console.error("Blocked bookings fetch error:", error);
      } finally {
        setBlockedDatesLoading(false);
      }
    }

    void loadBlockedBookings();
  }, [vehicleId, type]);

  const rentalDays = useMemo(() => {
    if (!startDate || !endDate) return 0;
    const days = dateDiffInDays(startDate, endDate);
    return days > 0 ? days : 0;
  }, [startDate, endDate]);

  const chauffeurFee = useMemo(() => {
    if (type !== "rent" || !chauffeurRequired || rentalDays <= 0) return 0;
    return rentalDays * 50;
  }, [type, chauffeurRequired, rentalDays]);

  const totalAmount = useMemo(() => {
    if (type === "buy") return price;
    return rentalDays > 0 ? rentalDays * price + chauffeurFee : 0;
  }, [type, price, rentalDays, chauffeurFee]);

  const mapEmbedUrl = useMemo(() => {
    const query = pickupLocation.trim() || "Accra, Ghana";
    return `https://maps.google.com/maps?q=${encodeURIComponent(
      query
    )}&z=13&output=embed`;
  }, [pickupLocation]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");

    if (!fullName || !email || !phone) {
      setMessage("Please fill in your name, email, and phone.");
      return;
    }

    if (type === "rent" && (!startDate || !endDate || rentalDays <= 0)) {
      setMessage("Please choose valid rental dates in mm/dd/yyyy format or with the date picker.");
      return;
    }

    if (type === "rent" && !countryOfBirth) {
      setMessage("Please select your country of birth.");
      return;
    }

    if (type === "rent" && !handoverDocument) {
      setMessage("Please select the document you will hand over.");
      return;
    }

    if (!pickupLocation.trim()) {
      setMessage("Please enter a pickup location.");
      return;
    }

    if (type === "rent") {
      const hasOverlap = blockedBookings.some((booking) =>
        rangesOverlap(startDate, endDate, booking.start_date, booking.end_date)
      );

      if (hasOverlap) {
        setMessage(
          "Those dates are already booked for this vehicle. Please choose different dates."
        );
        return;
      }
    }

    setLoading(true);

    try {
      const payload = {
        vehicle_id: vehicleId,
        booking_type: type,
        full_name: fullName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        start_date: type === "rent" ? startDate : null,
        end_date: type === "rent" ? endDate : null,
        pickup_location: pickupLocation.trim(),
        chauffeur_required: type === "rent" ? chauffeurRequired : false,
        chauffeur_fee: type === "rent" ? chauffeurFee : 0,
        country_of_birth: type === "rent" ? countryOfBirth : null,
        handover_document: type === "rent" ? handoverDocument : null,
        notes: notes.trim() || null,
        unit_price: price,
        total_amount: totalAmount,
        status: "pending",
      };

      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error || "Could not create booking.");
        return;
      }

      router.push(
        `/payment?bookingId=${data.booking.id}&title=${encodeURIComponent(
          title
        )}&price=${totalAmount}&type=${type}`
      );
    } catch (error) {
      console.error("Booking submit error:", error);
      setMessage("Something went wrong while creating the booking.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-100 px-4 py-12">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1fr_420px]">
        <section className="rounded-3xl bg-white p-8 shadow-sm">
          <h1 className="text-3xl font-bold text-gray-900">
            {type === "rent" ? "Book Your Rental" : "Reserve This Vehicle"}
          </h1>
          <p className="mt-2 text-gray-500">{title}</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Full name"
              className="w-full rounded-2xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
            />

            <div className="grid gap-4 md:grid-cols-2">
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                type="email"
                className="w-full rounded-2xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
              />
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Phone number"
                className="w-full rounded-2xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
              />
            </div>

            {type === "rent" && (
              <>
                <div className="rounded-3xl border border-gray-200 p-4">
                  <div className="mb-3">
                    <p className="text-sm font-medium text-gray-700">
                      Select rental period
                    </p>
                    <p className="text-xs text-gray-500">
                      Enter manually as mm/dd/yyyy or tap the calendar button.
                    </p>
                  </div>

     <div className="grid gap-4 md:grid-cols-2 relative">
  {/* START DATE */}
  <div className="relative">
    <label className="mb-2 block text-sm font-medium text-gray-700">
      Start date
    </label>

    <input
      type="text"
      placeholder="mm/dd/yyyy"
      value={startDateInput}
      onFocus={() => setShowCalendar("start")}
      onChange={(e) => setStartDateInput(e.target.value)}
      className="w-full rounded-2xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
    />

    {showCalendar === "start" && (
      <div className="absolute z-50 mt-2 rounded-2xl border bg-white p-3 shadow-xl">
        <DayPicker
          mode="single"
          selected={startDate ? new Date(startDate) : undefined}
          onSelect={(date) => {
            if (!date) return;
            const formatted = `${String(date.getMonth() + 1).padStart(2, "0")}/${String(
              date.getDate()
            ).padStart(2, "0")}/${date.getFullYear()}`;
            setStartDateInput(formatted);
            setShowCalendar(null);
          }}
        />
      </div>
    )}
  </div>

  {/* END DATE */}
  <div className="relative">
    <label className="mb-2 block text-sm font-medium text-gray-700">
      End date
    </label>

    <input
      type="text"
      placeholder="mm/dd/yyyy"
      value={endDateInput}
      onFocus={() => setShowCalendar("end")}
      onChange={(e) => setEndDateInput(e.target.value)}
      className="w-full rounded-2xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
    />

    {showCalendar === "end" && (
      <div className="absolute z-50 mt-2 rounded-2xl border bg-white p-3 shadow-xl">
        <DayPicker
          mode="single"
          selected={endDate ? new Date(endDate) : undefined}
          onSelect={(date) => {
            if (!date) return;
            const formatted = `${String(date.getMonth() + 1).padStart(2, "0")}/${String(
              date.getDate()
            ).padStart(2, "0")}/${date.getFullYear()}`;
            setEndDateInput(formatted);
            setShowCalendar(null);
          }}
        />
      </div>
    )}
  </div>
</div>
                </div>

                <div className="rounded-2xl bg-gray-50 p-4 text-sm text-gray-700">
                  <p className="font-semibold">Unavailable dates</p>

                  {blockedDatesLoading ? (
                    <p className="mt-2 text-gray-500">
                      Loading unavailable dates...
                    </p>
                  ) : blockedBookings.length === 0 ? (
                    <p className="mt-2 text-gray-500">No blocked dates yet.</p>
                  ) : (
                    <div className="mt-3 space-y-2">
                      {blockedBookings.map((booking) => (
                        <div
                          key={booking.id}
                          className="rounded-xl border border-gray-200 bg-white px-3 py-2"
                        >
                          {booking.start_date} to {booking.end_date}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Country of birth
                    </label>
                    <select
                      value={countryOfBirth}
                      onChange={(e) => setCountryOfBirth(e.target.value)}
                      className="w-full rounded-2xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
                    >
                      <option value="">Select country</option>
                      {countries.map((country) => (
                        <option key={country.code} value={country.name}>
                          {country.flag} {country.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Document to hand over
                    </label>
                    <select
                      value={handoverDocument}
                      onChange={(e) => setHandoverDocument(e.target.value)}
                      className="w-full rounded-2xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
                    >
                      <option value="">Select document</option>
                      <option value="ghana_card">Ghana Card</option>
                      <option value="passport">Passport</option>
                    </select>
                  </div>
                </div>

                <div className="rounded-2xl border border-gray-200 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-semibold text-gray-900">
                        Need a chauffeur?
                      </p>
                      <p className="text-sm text-gray-500">
                        Toggle this on if you want a company driver.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setChauffeurRequired((prev) => !prev)}
                      className={`relative inline-flex h-8 w-16 items-center rounded-full transition ${
                        chauffeurRequired ? "bg-black" : "bg-gray-300"
                      }`}
                    >
                      <span
                        className={`inline-block h-6 w-6 transform rounded-full bg-white transition ${
                          chauffeurRequired ? "translate-x-9" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </>
            )}

            <div className="space-y-3">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  {type === "rent" ? "Pickup location" : "Preferred location"}
                </label>
                <input
                  value={pickupLocation}
                  onChange={(e) => setPickupLocation(e.target.value)}
                  placeholder={
                    type === "rent"
                      ? "Type a pickup location to preview it on the map"
                      : "Type your preferred location"
                  }
                  className="w-full rounded-2xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
                />
              </div>

              <div className="overflow-hidden rounded-3xl border border-gray-200">
                <iframe
                  title="Pickup location map"
                  src={mapEmbedUrl}
                  className="h-64 w-full"
                  loading="lazy"
                />
              </div>
            </div>

            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional notes"
              rows={5}
              className="w-full rounded-2xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
            />

            {message && <p className="text-sm text-red-600">{message}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-black px-5 py-3 font-semibold text-white disabled:opacity-60"
            >
              {loading ? "Processing..." : "Continue to Payment"}
            </button>
          </form>
        </section>

        <aside className="rounded-3xl bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-gray-900">Booking Summary</h2>

          <div className="mt-6 space-y-4 text-sm text-gray-700">
            <div className="rounded-2xl bg-gray-50 p-4">
              <p className="text-xs text-gray-400">Vehicle</p>
              <p className="mt-1 font-semibold text-gray-900">{title}</p>
            </div>

            <div className="rounded-2xl bg-gray-50 p-4">
              <p className="text-xs text-gray-400">Booking Type</p>
              <p className="mt-1 font-semibold capitalize text-gray-900">
                {type}
              </p>
            </div>

            <div className="rounded-2xl bg-gray-50 p-4">
              <p className="text-xs text-gray-400">
                {type === "rent" ? "Daily Rate" : "Vehicle Price"}
              </p>
              <p className="mt-1 font-semibold text-gray-900">
                ${price.toLocaleString()}
                {type === "rent" ? "/day" : ""}
              </p>
            </div>

            {type === "rent" && (
              <>
                <div className="rounded-2xl bg-gray-50 p-4">
                  <p className="text-xs text-gray-400">Rental period</p>
                  <p className="mt-1 font-semibold text-gray-900">
                    {startDateInput || "Not selected"} — {endDateInput || "Not selected"}
                  </p>
                </div>

                <div className="rounded-2xl bg-gray-50 p-4">
                  <p className="text-xs text-gray-400">Rental Days</p>
                  <p className="mt-1 font-semibold text-gray-900">{rentalDays}</p>
                </div>

                <div className="rounded-2xl bg-gray-50 p-4">
  <p className="text-xs text-gray-400">Chauffeur</p>

  {!chauffeurRequired ? (
    <p className="mt-1 font-semibold text-gray-900">No</p>
  ) : (
    <div className="mt-3 rounded-2xl bg-white p-3">
      <div className="flex items-center gap-3">
        <img
          src={selectedChauffeur.image}
          alt={selectedChauffeur.name}
          className="h-14 w-14 rounded-full border border-gray-200 object-cover"
        />
        <div>
          <p className="font-semibold text-gray-900">
            {selectedChauffeur.name}
          </p>
          <p className="text-sm text-gray-500">
            {selectedChauffeur.phone}
          </p>
          <p className="text-sm font-medium text-green-600">
            +${chauffeurFee} chauffeur fee
          </p>
        </div>
      </div>
    </div>
  )}
</div>

                <div className="rounded-2xl bg-gray-50 p-4">
                  <p className="text-xs text-gray-400">Country of Birth</p>
                  <p className="mt-1 font-semibold text-gray-900">
                    {countryOfBirth || "Not selected"}
                  </p>
                </div>

                <div className="rounded-2xl bg-gray-50 p-4">
                  <p className="text-xs text-gray-400">Document Handover</p>
                  <p className="mt-1 font-semibold text-gray-900">
                    {handoverDocument === "ghana_card"
                      ? "Ghana Card"
                      : handoverDocument === "passport"
                      ? "Passport"
                      : "Not selected"}
                  </p>
                </div>
              </>
            )}

            <div className="rounded-2xl bg-gray-50 p-4">
              <p className="text-xs text-gray-400">Pickup Location</p>
              <p className="mt-1 font-semibold text-gray-900">
                {pickupLocation || "Not entered"}
              </p>
            </div>

            <div className="rounded-2xl bg-black p-4 text-white">
              <p className="text-xs text-white/70">Total Amount</p>
              <p className="mt-1 text-2xl font-bold">
                ${totalAmount.toLocaleString()}
              </p>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}