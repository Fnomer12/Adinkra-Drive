"use client";

import Link from "next/link";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Cormorant_Garamond } from "next/font/google";

const font = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600"],
  style: ["normal", "italic"],
});

type NavLink = {
  label: string;
  href: string;
  sectionId?: string;
};

const navLinks: NavLink[] = [
  { label: "Home", href: "/", sectionId: "home" },
  { label: "Rent", href: "/rent" },
  { label: "Buy", href: "/buy" },
  { label: "About Us", href: "/about" },
];

export default function Navbar() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const links = useMemo(() => navLinks, []);

  const [activeHref, setActiveHref] = useState(pathname);
  const [isShrunk, setIsShrunk] = useState(false);
  const [underline, setUnderline] = useState({
    left: 0,
    width: 0,
    opacity: 0,
  });

  const navRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setActiveHref(pathname);
  }, [pathname]);

  useEffect(() => {
    const handleScroll = () => {
      setIsShrunk(window.scrollY > 40);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!isHome) return;

    const sections = links
      .filter((link) => link.sectionId)
      .map((link) => document.getElementById(link.sectionId!))
      .filter(Boolean) as HTMLElement[];

    if (!sections.length) return;

    const detect = () => {
      const pos = window.scrollY + 140;
      let current = sections[0];

      for (const section of sections) {
        if (pos >= section.offsetTop) current = section;
      }

      const match = links.find((link) => link.sectionId === current.id);
      if (match) setActiveHref(match.href);
    };

    detect();
    window.addEventListener("scroll", detect, { passive: true });

    return () => window.removeEventListener("scroll", detect);
  }, [isHome, links]);

  const updateUnderline = () => {
    const nav = navRef.current;
    if (!nav) return;

    const activeEl = nav.querySelector(
      `[data-nav-link="${activeHref}"]`
    ) as HTMLElement | null;

    if (!activeEl) {
      setUnderline((prev) => ({ ...prev, opacity: 0 }));
      return;
    }

    const navRect = nav.getBoundingClientRect();
    const rect = activeEl.getBoundingClientRect();

    const width = rect.width * 0.72;
    const left = rect.left - navRect.left + (rect.width - width) / 2;

    setUnderline({
      left,
      width,
      opacity: 1,
    });
  };

  useLayoutEffect(() => {
    const raf = requestAnimationFrame(updateUnderline);
    return () => cancelAnimationFrame(raf);
  }, [activeHref, pathname, isShrunk]);

  useEffect(() => {
    const handleResize = () => updateUnderline();

    window.addEventListener("resize", handleResize);

    if ("fonts" in document) {
      document.fonts.ready.then(() => updateUnderline());
    }

    return () => window.removeEventListener("resize", handleResize);
  }, [activeHref]);

  return (
    <header
      className={`sticky top-0 z-50 bg-black transition-all duration-500 ease-out ${
        isShrunk ? "shadow-xl" : "shadow-md"
      }`}
    >
      <div className="absolute inset-x-0 bottom-0 h-px bg-white/10" />

      <div
        className={`mx-auto max-w-7xl px-4 sm:px-6 transition-all duration-500 ease-out ${
          isShrunk ? "py-2 sm:py-3" : "py-4 sm:py-5"
        }`}
      >
        <div className="flex justify-center">
          <div
            ref={navRef}
            className={`relative flex items-center justify-center gap-4 transition-all duration-500 ease-out sm:gap-8 md:gap-12 ${
              isShrunk ? "scale-[0.94]" : "scale-100"
            }`}
          >
            {links.map((link) => {
              const isActive = activeHref === link.href;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  prefetch
                  onClick={() => setActiveHref(link.href)}
                  data-nav-link={link.href}
                  className={`${font.className} relative pb-3 italic tracking-wide transition-all duration-300 ease-out ${
                    isShrunk
                      ? "text-[1.1rem] sm:text-[1.55rem]"
                      : "text-[1.25rem] sm:text-[1.85rem]"
                  }`}
                >
                  <span
                    className={`transition-colors duration-300 ${
                      isActive ? "text-white" : "text-gray-400 hover:text-white"
                    }`}
                  >
                    {link.label}
                  </span>
                </Link>
              );
            })}

            <span
              className="pointer-events-none absolute bottom-0 h-[3px] rounded-full bg-yellow-400 shadow-[0_0_12px_rgba(250,204,21,0.6)] transition-all duration-300 ease-out"
              style={{
                left: `${underline.left}px`,
                width: `${underline.width}px`,
                opacity: underline.opacity,
              }}
            />
          </div>
        </div>
      </div>
    </header>
  );
}