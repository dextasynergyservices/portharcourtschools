"use client";

import { ChevronDown } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export function ProgramsDropdown() {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const programs = [
    {
      title: "Nursery & Early Childhood Foundations",
      desc: "Montessori, play-based, and blended development standards in PH.",
      href: "/schools?level=nursery",
    },
    {
      title: "Primary Education Excellence",
      desc: "Literacy benchmarks, numeracy, and foundational curriculum choices.",
      href: "/schools?level=primary",
    },
    {
      title: "Secondary & College Prep",
      desc: "WAEC, IGCSE, Cambridge, and STEM pathways for Rivers State students.",
      href: "/schools?level=secondary",
    },
    {
      title: "Teachers Spotlight Awards & Summit",
      desc: "Our annual flagship gathering celebrating classroom excellence.",
      href: "/events",
      badge: "Flagship",
    },
    {
      title: "Teacher Capacity Building",
      desc: "Accredited masterclasses in partnership with GeePhill.",
      href: "/events#training",
    },
    {
      title: "School Leadership & Governance",
      desc: "Retention, financial sustainability, and curriculum compliance.",
      href: "/blog?category=leadership",
    },
  ];

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold uppercase tracking-wider rounded-[2px] transition-all ${
          open
            ? "bg-[#184098] text-[#FDDA32]"
            : "bg-[#08276B] text-white hover:bg-[#184098]"
        }`}
      >
        <span>Educational Focus</span>
        <ChevronDown
          className={`size-3.5 transition-transform duration-200 ${
            open ? "rotate-180 text-[#FDDA32]" : "text-white/80"
          }`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="absolute left-0 top-full mt-2 w-[340px] sm:w-[420px] rounded-[2px] border border-[#D9DEEC] bg-white p-3 shadow-xl z-50"
          >
            <div className="px-3 py-2 border-b border-[#D9DEEC]/70 mb-2">
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#184098]">
                Curated Focus Areas
              </p>
              <p className="text-xs text-muted-foreground">
                Explore school levels, summit initiatives, and leadership
                training.
              </p>
            </div>

            <div className="space-y-1">
              {programs.map((p) => (
                <Link
                  key={p.title}
                  href={p.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-xl p-2.5 hover:bg-[#FAFBFF] border border-transparent hover:border-[#D9DEEC]/80 transition-colors group"
                >
                  <div className="flex items-center justify-between">
                    <p className="font-heading text-xs font-bold text-[#151B2E] group-hover:text-[#184098] transition-colors">
                      {p.title}
                    </p>
                    {p.badge && (
                      <span className="rounded-full bg-[#EEF2FA] text-[#184098] border border-[#D9DEEC] px-2 py-0.5 text-[9px] font-semibold">
                        {p.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">
                    {p.desc}
                  </p>
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
