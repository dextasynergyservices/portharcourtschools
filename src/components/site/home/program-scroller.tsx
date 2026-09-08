"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

interface Program {
  number: string;
  title: string;
  subtitle: string;
  href: string;
  tag: string;
  color: string;
  bgImage: string;
}

interface ProgramScrollerProps {
  programs: Program[];
}

function ArrowDiagonal({
  className = "size-3.5 ml-1",
}: {
  className?: string;
}) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block transition-transform duration-200 group-hover:translate-x-1 group-hover:-translate-y-1 ${className}`}
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M8.43934 3.21973H3.37645V0.219727H13.5607V10.1145H10.5607V5.34105L2.12132 13.7804L0 11.6591L8.43934 3.21973Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function ProgramScroller({ programs }: ProgramScrollerProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Mouse Drag-to-Scroll State
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [hasMoved, setHasMoved] = useState(false);

  const checkScroll = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const maxScroll = el.scrollWidth - el.clientWidth;
    setCanScrollLeft(el.scrollLeft > 15);
    setCanScrollRight(el.scrollLeft < maxScroll - 15);
  }, []);

  useEffect(() => {
    checkScroll();
    const el = scrollerRef.current;
    if (!el) return;

    // Mouse wheel horizontal scroll conversion
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        const maxScroll = el.scrollWidth - el.clientWidth;
        if (maxScroll <= 0) return;
        const isAtLeft = el.scrollLeft <= 5 && e.deltaY < 0;
        const isAtRight = el.scrollLeft >= maxScroll - 5 && e.deltaY > 0;
        if (!isAtLeft && !isAtRight) {
          e.preventDefault();
          el.scrollLeft += e.deltaY * 0.9;
          checkScroll();
        }
      }
    };

    // Mouse drag-to-scroll listeners
    let isDown = false;
    let startXPos = 0;
    let scrollStart = 0;

    const onMouseDown = (e: MouseEvent) => {
      isDown = true;
      setIsMouseDown(true);
      startXPos = e.pageX - el.offsetLeft;
      scrollStart = el.scrollLeft;
      setHasMoved(false);
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - el.offsetLeft;
      const walk = (x - startXPos) * 1.5;
      if (Math.abs(walk) > 4) {
        setHasMoved(true);
      }
      el.scrollLeft = scrollStart - walk;
      checkScroll();
    };

    const onMouseUp = () => {
      if (!isDown) return;
      isDown = false;
      setIsMouseDown(false);
      setTimeout(() => setHasMoved(false), 60);
    };

    el.addEventListener("scroll", checkScroll, { passive: true });
    el.addEventListener("wheel", onWheel, { passive: false });
    el.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    window.addEventListener("resize", checkScroll);

    return () => {
      el.removeEventListener("scroll", checkScroll);
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("resize", checkScroll);
    };
  }, [checkScroll]);

  const scroll = (direction: "left" | "right") => {
    const el = scrollerRef.current;
    if (!el) return;
    const scrollAmount = 360;
    el.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
    setTimeout(checkScroll, 350);
  };

  return (
    <div className="relative w-full group/scroller">
      {/* Scroll Navigation Header & Arrows */}
      <div className="flex items-center justify-between pb-4 border-b border-[#D9DEEC] mb-8">
        <div>
          <h2 className="h2_subheader">Research &amp; Focus Areas</h2>
          <p className="text-xs sm:text-sm text-[#55627D] mt-1 font-sans">
            Curriculum benchmarks, early learning diagnostics, and teacher
            career progression
          </p>
        </div>

        {/* Header Left/Right Arrow Controls */}
        <div className="flex items-center gap-3">
          <span className="hidden md:inline-block text-xs font-display font-semibold text-muted-foreground uppercase tracking-wider">
            Scroll Areas
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => scroll("left")}
              disabled={!canScrollLeft}
              className="flex size-11 items-center justify-center rounded-[2px] border border-[#184098]/30 bg-white text-[#184098] transition-all hover:bg-[#184098] hover:text-white disabled:opacity-30 disabled:pointer-events-none cursor-pointer shadow-xs"
              aria-label="Scroll left to see earlier programs"
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              type="button"
              onClick={() => scroll("right")}
              disabled={!canScrollRight}
              className="flex size-11 items-center justify-center rounded-[2px] border border-[#184098]/30 bg-[#184098] text-[#FDDA32] transition-all hover:bg-[#08276B] hover:text-white disabled:opacity-30 disabled:pointer-events-none cursor-pointer shadow-xs"
              aria-label="Scroll right to see next programs"
            >
              <ChevronRight className="size-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Floating Side Arrow for Direct Track Click (ICLE Pattern) */}
      {canScrollRight && (
        <button
          type="button"
          onClick={() => scroll("right")}
          aria-label="Scroll track right"
          className="hidden lg:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-20 size-12 items-center justify-center rounded-full bg-[#184098] text-[#FDDA32] shadow-xl hover:bg-[#08276B] hover:scale-110 transition-all cursor-pointer border-2 border-white"
        >
          <ChevronRight className="size-6" />
        </button>
      )}

      {canScrollLeft && (
        <button
          type="button"
          onClick={() => scroll("left")}
          aria-label="Scroll track left"
          className="hidden lg:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-20 size-12 items-center justify-center rounded-full bg-[#184098] text-[#FDDA32] shadow-xl hover:bg-[#08276B] hover:scale-110 transition-all cursor-pointer border-2 border-white"
        >
          <ChevronLeft className="size-6" />
        </button>
      )}

      {/* Horizontal Scroll Track (Smooth Touch, Wheel, and Drag Support with Hidden Scrollbars) */}
      <div
        ref={scrollerRef}
        className={`flex gap-6 overflow-x-auto pb-8 pt-6 snap-x snap-mandatory select-none no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden ${
          isMouseDown ? "cursor-grabbing" : "cursor-grab"
        }`}
      >
        {programs.map((prog) => (
          <Link
            key={prog.number}
            href={prog.href}
            onClick={(e) => {
              if (hasMoved) e.preventDefault();
            }}
            className="program-tile group shrink-0 w-[290px] sm:w-[330px] h-[380px] snap-start rounded-[4px] p-7 text-white shadow-lg flex flex-col justify-between relative overflow-hidden border border-white/10"
            style={{
              backgroundColor: prog.color,
            }}
          >
            {/* Background Pattern / Image Tint Overlay */}
            <div
              className="absolute inset-0 opacity-25 bg-cover bg-center mix-blend-multiply pointer-events-none"
              style={{ backgroundImage: `url(${prog.bgImage})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent pointer-events-none" />

            {/* Top metadata counter and pill */}
            <div className="relative z-10 flex items-center justify-between">
              <span className="font-display text-sm font-black text-[#FDDA32] tracking-wider">
                {prog.number}
              </span>
              <span className="rounded-[2px] bg-white/15 backdrop-blur-xs px-2.5 py-1 font-display text-[11px] font-bold uppercase tracking-widest text-white border border-white/20">
                {prog.tag}
              </span>
            </div>

            {/* Middle and Bottom Content */}
            <div className="relative z-10 space-y-2 mt-auto">
              <h3 className="font-heading text-xl sm:text-2xl font-black text-white group-hover:text-[#FDDA32] transition-colors leading-tight">
                {prog.title}
              </h3>
              <p className="text-xs sm:text-sm text-[#D9DEEC] leading-relaxed line-clamp-2">
                {prog.subtitle}
              </p>

              <div className="pt-3 border-t border-white/20 flex items-center justify-between text-xs font-display font-bold uppercase tracking-widest text-[#FDDA32]">
                <span>Explore Program</span>
                <ArrowDiagonal className="text-[#FDDA32]" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
