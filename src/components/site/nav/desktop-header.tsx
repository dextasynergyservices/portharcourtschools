"use client";

import { Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { ProgramsDropdown } from "./programs-dropdown";

interface DesktopHeaderProps {
  onOpenSearch: () => void;
}

export function DesktopHeader({ onOpenSearch }: DesktopHeaderProps) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Schools Directory", href: "/schools" },
    { name: "Blog", href: "/blog" },
    { name: "Events & Programmes", href: "/events" },
    { name: "Partners", href: "/partners" },
    { name: "About Us", href: "/about" },
    { name: "Contact", href: "/contact" },
  ];

  return (
    <header
      className={cn(
        "sticky top-0 z-40 hidden md:block w-full border-b transition-all duration-300",
        scrolled
          ? "border-[#D9DEEC] bg-white/98 shadow-sm backdrop-blur-lg"
          : "border-[#D9DEEC]/80 bg-white/95 backdrop-blur-md",
      )}
    >
      <div
        className={cn(
          "mx-auto flex max-w-7xl items-center justify-between px-6 lg:px-8 transition-all duration-300",
          scrolled ? "h-16" : "h-20",
        )}
      >
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group py-1">
          <Image
            src="/images/brand-logo.jpg"
            alt="PortHarcourtSchools"
            width={180}
            height={56}
            priority
            loading="eager"
            className={cn(
              "w-auto object-contain rounded-md transition-all duration-300 group-hover:scale-[1.02]",
              scrolled ? "h-9" : "h-11",
            )}
          />
        </Link>

        {/* Navigation Links + Programs Mega Dropdown */}
        <nav className="flex items-center space-x-1 lg:space-x-2">
          <ProgramsDropdown />

          {navLinks.map((link) => {
            const isActive =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative px-3.5 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${
                  isActive
                    ? "text-[#003cb8] border-b-2 border-[#003cb8]"
                    : "text-[#151B2E] hover:text-[#003cb8]"
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Right Actions: Search Trigger */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onOpenSearch}
            aria-label="Search schools and articles"
            className="flex size-10 items-center justify-center border border-[#D9DEEC] text-[#003cb8] hover:bg-[#EEF2FA] transition-colors rounded-[2px]"
          >
            <Search className="size-4.5" />
          </button>
        </div>
      </div>
    </header>
  );
}
