import { createClient } from "@/lib/supabase/server";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";

type Vehicle = {
  id: string;
  title: string;
  category: "rent" | "sale";
  price: number;
  image_url: string | null;
  brand: string;
  model: string;
  year: number;
  transmission: string;
  fuel_type: string;
  seats: number;
  description: string;
  status: "available" | "in_use" | "purchased";
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

function VehicleCard({ vehicle }: { vehicle: Vehicle }) {
  const isAvailable = vehicle.status === "available";

  return (
    <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
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
            <span className="font-medium text-gray-800">
              {vehicle.transmission}
            </span>
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
              ${Number(vehicle.price).toLocaleString()}/day
            </span>
          </div>
        </div>

                        {isAvailable ? (
                  <Link
                    href={`/booking?vehicleId=${vehicle.id}&title=${encodeURIComponent(
                      vehicle.title
                    )}&price=${vehicle.price}&type=rent`}
                    className="block w-full rounded-full bg-black px-4 py-3 text-center text-sm font-semibold text-white transition hover:opacity-90"
                  >
                    Rent Now
                  </Link>
                ) : (
                  <button
                    disabled
                    className="w-full cursor-not-allowed rounded-full bg-gray-300 px-4 py-3 text-sm font-semibold text-gray-600"
                  >
                    Currently In Use
                  </button>
                )}
      </div>
    </div>
  );
}

export default async function RentPage() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("vehicles")
    .select("*")
    .eq("category", "rent")
    .order("created_at", { ascending: false });

  const rentalCars = ((data as Vehicle[]) || []).filter(
    (vehicle) => vehicle.category === "rent"
  );

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      <Navbar />

      <section className="bg-black text-white">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <p className="text-sm uppercase tracking-[0.2em] text-gray-400">
            Rental Fleet
          </p>
          <h1 className="mt-4 text-4xl font-extrabold md:text-5xl">
            Cars for Rent
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-gray-300">
            Choose from our rental inventory for business, family trips,
            executive rides, and everyday convenience.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16">
        {rentalCars.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-gray-300 bg-white p-10 text-center">
            <h3 className="text-xl font-bold text-gray-900">
              No rental cars yet
            </h3>
            <p className="mt-3 text-gray-600">
              Upload rental vehicles from the admin dashboard and they will show
              here automatically.
            </p>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
            {rentalCars.map((vehicle) => (
              <VehicleCard key={vehicle.id} vehicle={vehicle} />
            ))}
          </div>
        )}
      </section>

      <Footer />
    </main>
  );
}