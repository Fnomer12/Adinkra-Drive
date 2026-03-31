"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const teamMembers = [
  {
    name: "Adjei Sampson Kofi",
    role: "Chief Executive Officer",
    image: "/team/Sampson.jpg",
  },
  {
    name: "Kwadwo Opoku Agyeman",
    role: "Operations Manager",
    image: "/team/Kwadwo.jpg",
  },
  {
    name: "Joseph Amedi",
    role: "Sales Manager",
    image: "/team/JoeBlac.jpeg",
  },
  {
    name: "Ameyaw Abishag Aboagyewaa",
    role: "Fleet Supervisor",
    image: "/team/Abishag.jpeg",
  },
  {
    name: "Festus Ayiku Blemano",
    role: "Customer Relations Lead",
    image: "/team/Festus.jpeg",
  },
];

const shopImages = [
  "/shop/shop-1.jpg",
  "/shop/shop-2.jpg",
  "/shop/shop-3.jpg",
];

function getYearsInOperation(startYear: number) {
  const currentYear = new Date().getFullYear();
  return Math.max(currentYear - startYear, 0);
}

function getTimelineYears(startYear: number) {
  const currentYear = new Date().getFullYear();
  return Array.from(
    { length: currentYear - startYear + 1 },
    (_, index) => startYear + index
  );
}

function Reveal({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(element);
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transform transition-all duration-700 ease-out ${
        visible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
      }`}
    >
      {children}
    </div>
  );
}

export default function AboutPage() {
  const startYear = 2021;
  const yearsInOperation = getYearsInOperation(startYear);
  const timelineYears = useMemo(() => getTimelineYears(startYear), [startYear]);
  const currentYear = new Date().getFullYear();

  return (
    <main className="min-h-screen bg-white text-gray-900">
      <Navbar />

      <section className="relative overflow-hidden text-white">
        <div className="absolute inset-0">
          <img
            src="/about-bg.jpg"
            alt="Adinkra Drive background"
            className="h-full w-full object-cover"
          />
        </div>

        <div className="absolute inset-0 bg-black/60" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />

        <div className="relative z-10 mx-auto max-w-7xl px-6 py-20 md:py-28">
          <Reveal>
            <div className="max-w-4xl">
              <span className="inline-flex rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm text-gray-200 backdrop-blur-sm">
                About Adinkra Drive
              </span>

              <h1 className="mt-6 text-4xl font-extrabold leading-tight md:text-6xl">
                Built on trust, driven by excellence, and focused on premium
                mobility since <span className="text-yellow-400">2021</span>
              </h1>

              <p className="mt-6 max-w-3xl text-lg leading-8 text-gray-300 md:text-xl">
                Adinkra Drive was established to provide dependable car rentals
                and vehicle sales with a touch of elegance. We believe mobility
                should feel simple, trustworthy, and premium.
              </p>

              <div className="mt-10 grid gap-4 sm:grid-cols-3">
                <Reveal delay={50}>
                  <div className="rounded-3xl border border-white/10 bg-white/10 p-6 backdrop-blur-md">
                    <p className="text-sm uppercase tracking-[0.2em] text-gray-300">
                      Started
                    </p>
                    <h3 className="mt-3 text-3xl font-bold">{startYear}</h3>
                  </div>
                </Reveal>

                <Reveal delay={120}>
                  <div className="rounded-3xl border border-white/10 bg-white/10 p-6 backdrop-blur-md">
                    <p className="text-sm uppercase tracking-[0.2em] text-gray-300">
                      Years of Service
                    </p>
                    <h3 className="mt-3 text-3xl font-bold">
                      {yearsInOperation}+
                    </h3>
                  </div>
                </Reveal>

                <Reveal delay={190}>
                  <div className="rounded-3xl border border-white/10 bg-white/10 p-6 backdrop-blur-md">
                    <p className="text-sm uppercase tracking-[0.2em] text-gray-300">
                      Focus
                    </p>
                    <h3 className="mt-3 text-3xl font-bold">Rent & Sales</h3>
                  </div>
                </Reveal>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="bg-white text-gray-900">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <Reveal>
            <div className="mb-12 max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">
                Leadership Team
              </p>
              <h2 className="mt-3 text-3xl font-bold md:text-4xl">
                Meet the people behind Adinkra Drive
              </h2>
              <p className="mt-4 text-gray-600">
                Our strength comes from leadership, operations, customer care,
                and a shared commitment to making every journey smooth and
                memorable.
              </p>
            </div>
          </Reveal>

          {/* Mobile swipe layout */}
          <div className="md:hidden">
            <div className="flex snap-x snap-mandatory overflow-x-auto pb-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {teamMembers.map((member, index) => (
                <div
                  key={member.name}
                  className="flex min-w-full snap-center justify-center px-4"
                >
                  <Reveal delay={index * 80}>
                    <div className="flex max-w-xs flex-col items-center text-center">
                      <div className="relative h-44 w-44 overflow-hidden rounded-full border-4 border-gray-100 bg-gray-100 shadow-md">
                        <img
                          src={member.image}
                          alt={member.name}
                          className="h-full w-full object-cover"
                        />
                      </div>

                      <h3 className="mt-5 text-2xl font-semibold leading-tight text-gray-900">
                        {member.name}
                      </h3>

                      <p className="mt-2 text-base text-gray-500">
                        {member.role}
                      </p>
                    </div>
                  </Reveal>
                </div>
              ))}
            </div>

            <p className="mt-6 text-center text-sm text-gray-400">
              Swipe left or right to view the team
            </p>
          </div>

          {/* Desktop/tablet grid layout */}
          <div className="hidden gap-12 sm:grid-cols-2 md:grid md:grid-cols-3 xl:grid-cols-5">
            {teamMembers.map((member, index) => (
              <Reveal key={member.name} delay={index * 80}>
                <div className="group flex flex-col items-center text-center">
                  <div className="relative h-40 w-40 overflow-hidden rounded-full border-4 border-gray-100 bg-gray-100 shadow-md transition duration-500 group-hover:scale-105 group-hover:shadow-xl">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/0 transition group-hover:bg-black/10" />
                  </div>

                  <h3 className="mt-6 text-lg font-semibold text-gray-900">
                    {member.name}
                  </h3>
                  <p className="text-sm text-gray-500">{member.role}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-gray-200 bg-gray-50 text-gray-900">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr]">
            <Reveal>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">
                  How It Started
                </p>
                <h2 className="mt-3 text-3xl font-bold md:text-4xl">
                  The story behind Adinkra Drive
                </h2>

                <div className="mt-6 space-y-5 text-lg leading-8 text-gray-600">
                  <p>
                    Adinkra Drive began in 2021 with a clear purpose: to make
                    car rentals and vehicle ownership more dependable, stylish,
                    and customer-centered. The vision was simple — create a
                    mobility brand that people could trust for quality service
                    and a premium experience.
                  </p>

                  <p>
                    What started as a focused idea quickly grew into a service
                    model built on professionalism, consistency, and strong
                    customer relationships. From helping clients secure vehicles
                    for personal travel to supporting businesses and executives
                    with reliable transport options, the brand has continued to
                    evolve with the needs of the market.
                  </p>

                  <p>
                    Today, Adinkra Drive stands as a growing company committed
                    to excellence in both rentals and vehicle sales, with an eye
                    on the future and a determination to keep improving every
                    year.
                  </p>
                </div>
              </div>
            </Reveal>

            <Reveal delay={120}>
              <div className="rounded-[2rem] border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">
                  Growth Timeline
                </p>
                <h3 className="mt-3 text-xl font-bold sm:text-2xl">
                  Our journey from {startYear} to {currentYear}
                </h3>

                <div className="mt-8 space-y-6">
                  {timelineYears.map((year, index) => {
                    const isLast = index === timelineYears.length - 1;

                    return (
                      <div key={year} className="relative flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className="h-4 w-4 rounded-full bg-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.5)]" />
                          {!isLast && (
                            <div className="mt-2 h-full min-h-[48px] w-[2px] bg-gray-200" />
                          )}
                        </div>

                        <div className="pb-4 sm:pb-6">
                          <h4 className="text-base font-semibold text-gray-900 sm:text-lg">
                            {year}
                          </h4>
                          <p className="mt-1 text-sm leading-6 text-gray-600">
                            {year === startYear
                              ? "The beginning of the Adinkra Drive vision."
                              : year === currentYear
                              ? "Continuing to grow, improve, and serve customers with excellence."
                              : "A year of steady growth, stronger customer trust, and expanding service quality."}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="bg-white text-gray-900">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <Reveal>
            <div className="mb-12 max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">
                Our Shop
              </p>
              <h2 className="mt-3 text-3xl font-bold md:text-4xl">
                A look at our space
              </h2>
              <p className="mt-4 text-gray-600">
                Here are a few views of our shop and working environment, where
                we prepare, present, and manage vehicles for our customers.
              </p>
            </div>
          </Reveal>

          {/* Mobile swipe layout */}
          <div className="md:hidden">
            <div className="flex snap-x snap-mandatory overflow-x-auto gap-4 px-2 pb-4 scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {shopImages.map((image, index) => (
                <div key={image} className="min-w-full snap-center">
                  <Reveal delay={index * 100}>
                    <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-md">
                      <img
                        src={image}
                        alt={`Shop view ${index + 1}`}
                        className="h-72 w-full object-cover"
                      />
                    </div>
                  </Reveal>
                </div>
              ))}
            </div>

            <p className="mt-5 text-center text-sm text-gray-400">
              Swipe left or right to view our shop
            </p>
          </div>

          {/* Desktop grid */}
          <div className="hidden gap-6 md:grid md:grid-cols-3">
            {shopImages.map((image, index) => (
              <Reveal key={image} delay={index * 90}>
                <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
                  <img
                    src={image}
                    alt={`Adinkra Drive shop view ${index + 1}`}
                    className="h-72 w-full object-cover transition duration-500 hover:scale-105"
                  />
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-gray-200 bg-white text-gray-900">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="grid gap-6 md:grid-cols-3">
            <Reveal>
              <div className="rounded-3xl border border-gray-200 bg-gray-50 p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
                <p className="text-sm uppercase tracking-[0.2em] text-gray-500">
                  Mission
                </p>
                <h3 className="mt-3 text-2xl font-bold text-gray-900">
                  Serve with excellence
                </h3>
                <p className="mt-3 text-gray-600">
                  To provide premium, accessible, and dependable mobility
                  solutions for individuals, families, and businesses.
                </p>
              </div>
            </Reveal>

            <Reveal delay={100}>
              <div className="rounded-3xl border border-gray-200 bg-gray-50 p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
                <p className="text-sm uppercase tracking-[0.2em] text-gray-500">
                  Vision
                </p>
                <h3 className="mt-3 text-2xl font-bold text-gray-900">
                  Grow with trust
                </h3>
                <p className="mt-3 text-gray-600">
                  To become one of Ghana’s most trusted brands in car rentals
                  and vehicle sales.
                </p>
              </div>
            </Reveal>

            <Reveal delay={200}>
              <div className="rounded-3xl border border-gray-200 bg-gray-50 p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
                <p className="text-sm uppercase tracking-[0.2em] text-gray-500">
                  Promise
                </p>
                <h3 className="mt-3 text-2xl font-bold text-gray-900">
                  Premium experience
                </h3>
                <p className="mt-3 text-gray-600">
                  Every vehicle, every interaction, and every service moment
                  should reflect quality, style, and reliability.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}