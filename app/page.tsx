import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />

      <section className="relative min-h-[92vh] overflow-hidden">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 h-full w-full object-cover brightness-110 contrast-110"
        >
          <source src="/advert.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>

        <div className="absolute inset-0 bg-black/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/35 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10" />

        <div className="relative z-10 mx-auto flex min-h-[92vh] max-w-7xl items-center px-6">
          <div className="max-w-3xl">
            <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm text-gray-100 backdrop-blur-sm">
              Trusted mobility for every journey
            </span>

            <h1 className="mt-6 text-5xl font-extrabold leading-tight md:text-7xl">
              Drive in style with{" "}
              <span className="text-yellow-400">Adinkra Drive</span>
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-gray-200 md:text-xl">
              Explore quality vehicles for rent and purchase. Whether you need a
              car for a short trip, business use, or long-term ownership, we
              make the process simple, elegant, and reliable.
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <a
                href="/rent"
                className="rounded-full bg-yellow-400 px-6 py-3 font-semibold text-black transition hover:bg-yellow-300"
              >
                Browse Rentals
              </a>

              <a
                href="/buy"
                className="rounded-full border border-white/25 bg-white/10 px-6 py-3 font-semibold text-white transition hover:bg-white hover:text-black"
              >
                Browse Cars for Sale
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white text-gray-900">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="grid gap-8 md:grid-cols-3">
            <div className="rounded-3xl border border-gray-200 bg-gray-50 p-6 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-widest text-gray-500">
                Premium Rentals
              </p>
              <h3 className="mt-3 text-2xl font-bold">Flexible options</h3>
              <p className="mt-3 text-gray-600">
                Choose vehicles for business trips, family outings, airport
                pickups, and executive comfort.
              </p>
            </div>

            <div className="rounded-3xl border border-gray-200 bg-gray-50 p-6 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-widest text-gray-500">
                Vehicle Sales
              </p>
              <h3 className="mt-3 text-2xl font-bold">Own with confidence</h3>
              <p className="mt-3 text-gray-600">
                Browse quality vehicles available for purchase with clear
                availability and trusted details.
              </p>
            </div>

            <div className="rounded-3xl border border-gray-200 bg-gray-50 p-6 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-widest text-gray-500">
                Trusted Service
              </p>
              <h3 className="mt-3 text-2xl font-bold">Simple process</h3>
              <p className="mt-3 text-gray-600">
                From first inquiry to final handover, Adinkra Drive keeps the
                experience smooth, premium, and reliable.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="contact" className="bg-gray-50 text-gray-900">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="grid gap-10 md:grid-cols-2">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-gray-500">
                Contact Us
              </p>
              <h2 className="mt-2 text-3xl font-bold md:text-4xl">
                Let’s get you on the road
              </h2>
              <p className="mt-4 text-gray-600">
                Reach out for rentals, purchases, fleet inquiries, and special
                requests.
              </p>

              <div className="mt-8 space-y-4 text-gray-700">
                <p>
                  <span className="font-semibold">Phone:</span> +233 XX XXX XXXX
                </p>
                <p>
                  <span className="font-semibold">Email:</span>{" "}
                  info@adinkradrive.com
                </p>
                <p>
                  <span className="font-semibold">Location:</span> Accra, Ghana
                </p>
              </div>
            </div>

            <form className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="grid gap-4">
                <input
                  type="text"
                  placeholder="Full Name"
                  className="rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
                />
                <input
                  type="email"
                  placeholder="Email Address"
                  className="rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
                />
                <input
                  type="text"
                  placeholder="Phone Number"
                  className="rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
                />
                <textarea
                  placeholder="Tell us what you need..."
                  rows={5}
                  className="rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
                />
                <button
                  type="submit"
                  className="rounded-xl bg-black px-5 py-3 font-semibold text-white transition hover:opacity-90"
                >
                  Send Message
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}