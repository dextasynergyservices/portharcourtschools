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
      className={`fixed bottom-0 inset-x-0 z-40 md:hidden bg-[#071E54] border-t border-white/10 shadow-2xl safe-bottom will-change-transform select-none transition-transform duration-300 ease-out ${
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
              className="flex flex-col items-center justify-center flex-1 py-1 transition-all active:scale-95 touch-target select-none"
            >
              <div className="relative">
                {isActive ? (
                  <div className="size-8 rounded-full bg-[#FDC82F] flex items-center justify-center text-[#071E54] shadow-xs">
                    <Icon className="size-4.5 text-[#071E54]" />
                  </div>
                ) : (
                  <div className="size-8 flex items-center justify-center text-white/75 hover:text-white">
                    <Icon className="size-5 text-white/75" />
                  </div>
                )}
              </div>
              <span
                className={`text-[10px] mt-0.5 tracking-tight ${
                  isActive
                    ? "font-bold text-[#FDC82F]"
                    : "font-medium text-white/75"
                }`}
              >
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
          className="flex flex-col items-center justify-center flex-1 py-1 transition-all active:scale-95 touch-target select-none"
        >
          <div className="relative">
            {moreOpen ? (
              <div className="size-8 rounded-full bg-[#FDC82F] flex items-center justify-center text-[#071E54] shadow-xs">
                <MoreHorizontal className="size-4.5 text-[#071E54]" />
              </div>
            ) : (
              <div className="size-8 flex items-center justify-center text-white/75 hover:text-white">
                <MoreHorizontal className="size-5 text-white/75" />
              </div>
            )}
          </div>
          <span
            className={`text-[10px] mt-0.5 tracking-tight ${
              moreOpen
                ? "font-bold text-[#FDC82F]"
                : "font-medium text-white/75"
            }`}
          >
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
