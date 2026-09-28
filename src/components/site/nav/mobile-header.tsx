"use client";

import { Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import logoImg from "../../../../public/images/logo.png";

interface MobileHeaderProps {
  onOpenSearch: () => void;
}

export function MobileHeader({ onOpenSearch }: MobileHeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-[70px] items-center justify-between border-b border-[#D9DEEC] bg-white/95 px-4 backdrop-blur-md md:hidden">
      {/* Brand Logo */}
      <Link href="/" className="flex items-center gap-2">
        <Image
          src={logoImg}
          alt="Schools Voice"
          priority
          loading="eager"
          className="h-12 w-auto object-contain rounded"
        />
      </Link>

      {/* Action: Expandable Search Trigger */}
      <button
        type="button"
        onClick={onOpenSearch}
        aria-label="Open search"
        className="flex size-9 items-center justify-center rounded-lg border border-[#D9DEEC] text-[#184098] hover:bg-[#EEF2FA] touch-target transition-colors"
      >
        <Search className="size-4" />
      </button>
    </header>
  );
}
