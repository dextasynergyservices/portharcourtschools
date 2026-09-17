"use client";

import {
  BookOpen,
  Calendar,
  House,
  MoreHorizontal,
  School,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface BottomTabBarProps {
  onOpenMore: () => void;
  moreOpen: boolean;
}

export function BottomTabBar({ onOpenMore, moreOpen }: BottomTabBarProps) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > 80 && currentScrollY > lastScrollY + 6) {
        setHidden(true);
      } else if (currentScrollY < lastScrollY - 6 || currentScrollY < 60) {
        setHidden(false);
      }
      lastScrollY = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const tabs = [
    { name: "Home", href: "/", icon: House, isExact: true },
    { name: "Blog", href: "/blog", icon: BookOpen, isExact: false },
    { name: "Schools", href: "/schools", icon: School, isExact: false },
    { name: "Events", href: "/events", icon: Calendar, isExact: false },
  ];

  const isBarHidden = hidden && !moreOpen;

  const content = (
    <nav
      aria-label="Mobile Navigation"
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 40,
        transform: isBarHidden
          ? "translate3d(0, 100%, 0)"
          : "translate3d(0, 0, 0)",
      }}
      className={`fixed bottom-0 inset-x-0 z-40 md:hidden bg-[#003cb8] border-t border-[#002c8c] shadow-2xl safe-bottom will-change-transform select-none transition-transform duration-300 ease-out ${
        isBarHidden ? "pointer-events-none" : "pointer-events-auto"
      }`}
    >
      <div className="flex h-16 items-center justify-around px-2 text-white">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = tab.isExact
            ? pathname === tab.href
            : pathname.startsWith(tab.href);

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center justify-center flex-1 py-1 transition-all active:scale-90 touch-target select-none text-white ${
                isActive
                  ? "font-bold scale-105 opacity-100"
                  : "opacity-80 hover:opacity-100"
              }`}
            >
              <div className="relative text-white">
                <Icon className="size-5 text-white" />
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 size-1 rounded-full bg-white" />
                )}
              </div>
              <span className="text-[11px] mt-1 font-medium tracking-tight text-white">
                {tab.name}
              </span>
            </Link>
          );
        })}

        {/* 5th Tab: More (Drawer Trigger with Ellipsis ...) */}
        <button
          type="button"
          onClick={onOpenMore}
          aria-expanded={moreOpen}
          aria-haspopup="dialog"
          aria-label="Open menu and more navigation links"
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-all active:scale-90 touch-target select-none text-white ${
            moreOpen
              ? "font-bold scale-105 opacity-100"
              : "opacity-80 hover:opacity-100"
          }`}
        >
          <div className="relative text-white">
            <MoreHorizontal className="size-5 text-white" />
            {moreOpen && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 size-1 rounded-full bg-white" />
            )}
          </div>
          <span className="text-[11px] mt-1 font-medium tracking-tight text-white">
            More
          </span>
        </button>
      </div>
    </nav>
  );

  if (!mounted) {
    return null;
  }

  return createPortal(content, document.body);
}
