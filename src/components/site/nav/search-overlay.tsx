"use client";

import { Search, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchOverlay({ isOpen, onClose }: SearchOverlayProps) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") onClose();
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  }, [isOpen, onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/schools?q=${encodeURIComponent(query.trim())}`);
      onClose();
    }
  };

  const quickFilters = [
    { label: "Nursery Schools", href: "/schools?level=nursery" },
    { label: "Primary Schools", href: "/schools?level=primary" },
    { label: "Secondary Schools", href: "/schools?level=secondary" },
    { label: "Old GRA", href: "/schools?area=old-gra" },
    { label: "Woji", href: "/schools?area=woji" },
    { label: "British Curriculum", href: "/schools?curriculum=british" },
    { label: "Tuition Fees", href: "/blog?category=fees" },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 bg-[#08276B]/80 backdrop-blur-md flex flex-col justify-start pt-16 sm:pt-24 px-4 sm:px-6"
        >
          {/* Close button top right */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close search overlay"
            className="absolute top-5 right-5 sm:top-8 sm:right-8 flex size-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors touch-target"
          >
            <X className="size-5" />
          </button>

          {/* Search Content Container */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="mx-auto w-full max-w-3xl space-y-6 text-white"
          >
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#FDDA32]">
                Directory & Insights Search
              </span>
              <h2 className="font-heading text-2xl sm:text-4xl font-black tracking-tight text-white">
                What are you looking for?
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="relative">
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search school name, neighbourhood, curriculum, or topic..."
                className="h-14 sm:h-16 w-full rounded-2xl border-2 border-white/20 bg-white/10 px-5 pr-14 text-base sm:text-lg text-white placeholder:text-white/50 focus:border-[#FDDA32] focus:outline-none focus:ring-4 focus:ring-[#FDDA32]/20 shadow-xl"
              />
              <button
                type="submit"
                aria-label="Submit search"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 flex size-10 sm:size-11 items-center justify-center rounded-xl bg-[#FDDA32] text-[#08276B] hover:bg-[#E0B71E] font-bold transition-transform active:scale-95 touch-target"
              >
                <Search className="size-5" />
              </button>
            </form>

            {/* Quick Filter Tags */}
            <div className="space-y-2 pt-2">
              <span className="text-xs font-semibold text-white/70">
                Popular Searches:
              </span>
              <div className="flex flex-wrap gap-2">
                {quickFilters.map((filter) => (
                  <button
                    key={filter.label}
                    type="button"
                    onClick={() => {
                      router.push(filter.href);
                      onClose();
                    }}
                    className="rounded-lg border border-white/20 bg-white/5 px-3 py-1.5 text-xs font-medium text-white hover:border-[#FDDA32] hover:bg-white/15 transition-colors"
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
