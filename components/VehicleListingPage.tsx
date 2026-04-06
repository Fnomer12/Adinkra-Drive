import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import type { Vehicle } from "@/lib/vehicles";

type VehicleListingPageProps = {
  vehicles: Vehicle[];
  mode: "rent" | "sale";
};

function getStatusClasses(status: Vehicle["status"]) {
  if (status === "available") return "bg-green-100 text-green-700";
  if (status === "in_use") return "bg-yellow-100 text-yellow-700";
  return "bg-red-100 text-red-700";
}

function getStatusLabel(status: Vehicle["status"]) {
  if (status === "in_use") return "In Use";
  if (status === "purchased") return "Purchased";
  return "Available";
}

function VehicleCard({ vehicle, mode }: { vehicle: Vehicle; mode: "rent" | "sale" }) {
  const isAvailable = vehicle.status === "available";
  const isRent = mode === "rent";

  const href = isRent
    ? `/booking?vehicleId=${vehicle.id}&title=${encodeURIComponent(
        vehicle.title
      )}&price=${vehicle.price}&type=rent`
    : `/booking?vehicleId=${vehicle.id}&title=${encodeURIComponent(
        vehicle.title
      )}&price=${vehicle.price}&type=buy`;

  return (
    <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">
      <img
        src={vehicle.image_url || "/placeholder-car.jpg"}
        alt={vehicle.title}
        className="h-64 w-full object-cover"
      />

      <div className="p-6">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900">{vehicle.title}</h3>
            <p className="text-sm text-gray-500">
              {vehicle.brand} • {vehicle.model} • {vehicle.year}
            </p>
          </div>

          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClasses(
              vehicle.status
            )}`}
          >
            {getStatusLabel(vehicle.status)}
          </span>
        </div>

        <p className="mb-5 text-sm leading-6 text-gray-600">
          {vehicle.description}
        </p>

        <div className="mb-5 grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-2xl bg-gray-50 p-3">
            <span className="block text-xs text-gray-400">Transmission</span>
            <span className="font-medium text-gray-800">{vehicle.transmission}</span>
          </div>

          <div className="rounded-2xl bg-gray-50 p-3">
            <span className="block text-xs text-gray-400">Fuel</span>
            <span className="font-medium text-gray-800">{vehicle.fuel_type}</span>
          </div>

          <div className="rounded-2xl bg-gray-50 p-3">
            <span className="block text-xs text-gray-400">Seats</span>
            <span className="font-medium text-gray-800">{vehicle.seats}</span>
          </div>

          <div className="rounded-2xl bg-gray-50 p-3">
            <span className="block text-xs text-gray-400">Price</span>
            <span className="font-medium text-gray-800">
              {isRent
                ? `$${Number(vehicle.price).toLocaleString()}/day`
                : `$${Number(vehicle.price).toLocaleString()}`}
            </span>
          </div>
        </div>

        {isAvailable ? (
          <Link
            href={href}
            className="block w-full rounded-full bg-black px-4 py-3 text-center text-sm font-semibold text-white transition hover:opacity-90"
            prefetch
          >
            {isRent ? "Rent Now" : "Buy Now"}
          </Link>
        ) : (
          <button
            disabled
            className="w-full cursor-not-allowed rounded-full bg-gray-300 px-4 py-3 text-sm font-semibold text-gray-600"
          >
            {isRent ? "Currently In Use" : "Purchased"}
          </button>
        )}
      </div>
    </div>
  );
}

export default function VehicleListingPage({
  vehicles,
  mode,
}: VehicleListingPageProps) {
  const isRent = mode === "rent";

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      <Navbar />

      <section className="bg-black text-white">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <p className="text-sm uppercase tracking-[0.2em] text-gray-400">
            {isRent ? "Rental Fleet" : "Purchase Inventory"}
          </p>

          <h1 className="mt-4 text-4xl font-extrabold md:text-5xl">
            {isRent ? "Cars for Rent" : "Cars for Sale"}
          </h1>

          <p className="mt-4 max-w-2xl text-lg text-gray-300">
            {isRent
              ? "Choose from our rental inventory for business, family trips, executive rides, and everyday convenience."
              : "Browse vehicles available for ownership with clear availability and trusted details."}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16">
        {vehicles.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-gray-300 bg-white p-10 text-center">
            <h3 className="text-xl font-bold text-gray-900">
              {isRent ? "No rental cars yet" : "No cars for sale yet"}
            </h3>
            <p className="mt-3 text-gray-600">
              {isRent
                ? "Upload rental vehicles from the admin dashboard and they will show here automatically."
                : "Upload sale vehicles from the admin dashboard and they will show here automatically."}
            </p>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
            {vehicles.map((vehicle) => (
              <VehicleCard key={vehicle.id} vehicle={vehicle} mode={mode} />
            ))}
          </div>
        )}
      </section>

      <Footer />
    </main>
  );
}