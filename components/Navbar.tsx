"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
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
  const [activeHref, setActiveHref] = useState(pathname);
  const [isShrunk, setIsShrunk] = useState(false);
  const [underline, setUnderline] = useState({
    left: 0,
    width: 0,
    opacity: 0,
  });

  const navRef = useRef<HTMLDivElement | null>(null);
  const linkRefs = useRef<Record<string, HTMLAnchorElement | null>>({});

  const isHome = pathname === "/";
  const links = useMemo(() => navLinks, []);

  useEffect(() => {
    setActiveHref(pathname);
  }, [pathname]);

  useEffect(() => {
    const handleScroll = () => {
      setIsShrunk(window.scrollY > 40);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!isHome) return;

    const sections = navLinks
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

      const match = navLinks.find((link) => link.sectionId === current.id);
      if (match) setActiveHref(match.href);
    };

    window.addEventListener("scroll", detect);
    detect();

    return () => window.removeEventListener("scroll", detect);
  }, [isHome]);

  useEffect(() => {
    const updateUnderline = () => {
      const el = linkRefs.current[activeHref];
      const nav = navRef.current;

      if (!el || !nav) {
        setUnderline((prev) => ({ ...prev, opacity: 0 }));
        return;
      }

      const navRect = nav.getBoundingClientRect();
      const rect = el.getBoundingClientRect();

      setUnderline({
        left: rect.left - navRect.left + rect.width * 0.05,
        width: rect.width * 0.9,
        opacity: 1,
      });
    };

    const raf = requestAnimationFrame(updateUnderline);

    window.addEventListener("resize", updateUnderline);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", updateUnderline);
    };
  }, [activeHref, isShrunk]);

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
                      prefetch={true}
                      ref={(el) => {
                        linkRefs.current[link.href] = el;
                      }}
                      className={`${font.className} relative pb-2 italic tracking-wide transition-all duration-500 ease-out ${
                        isShrunk
                          ? "text-[1.1rem] sm:text-[1.55rem]"
                          : "text-[1.25rem] sm:text-[1.85rem]"
                      }`}
                    >
                  <span
                    className={`transition duration-300 ${
                      isActive ? "text-white" : "text-gray-400 hover:text-white"
                    }`}
                  >
                    {link.label}
                  </span>
                </Link>
              );
            })}

            <span
              className="pointer-events-none absolute bottom-0 h-[2.5px] rounded-full bg-yellow-400 shadow-[0_0_12px_rgba(250,204,21,0.6)] transition-all duration-300 ease-out"
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