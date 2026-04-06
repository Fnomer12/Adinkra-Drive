import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function VehicleListingSkeleton() {
  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      <Navbar />

      <section className="bg-black text-white">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="h-4 w-36 animate-pulse rounded bg-gray-700" />
          <div className="mt-4 h-12 w-64 animate-pulse rounded bg-gray-700" />
          <div className="mt-4 h-6 max-w-2xl animate-pulse rounded bg-gray-800" />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm"
            >
              <div className="h-64 w-full animate-pulse bg-gray-200" />
              <div className="p-6">
                <div className="h-6 w-2/3 animate-pulse rounded bg-gray-200" />
                <div className="mt-2 h-4 w-1/2 animate-pulse rounded bg-gray-200" />
                <div className="mt-4 h-16 w-full animate-pulse rounded bg-gray-100" />
                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="h-16 animate-pulse rounded-2xl bg-gray-100" />
                  <div className="h-16 animate-pulse rounded-2xl bg-gray-100" />
                  <div className="h-16 animate-pulse rounded-2xl bg-gray-100" />
                  <div className="h-16 animate-pulse rounded-2xl bg-gray-100" />
                </div>
                <div className="mt-5 h-12 w-full animate-pulse rounded-full bg-gray-200" />
              </div>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </main>
  );
}