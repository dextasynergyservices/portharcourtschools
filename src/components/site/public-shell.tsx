"use client";

import dynamic from "next/dynamic";
import type { ReactNode } from "react";
import { useState } from "react";
import { SiteFooter } from "./footer";
import { BottomTabBar } from "./nav/bottom-tab-bar";
import { DesktopHeader } from "./nav/desktop-header";
import { MobileHeader } from "./nav/mobile-header";

// Code-split heavy interactive overlays so they load on-demand
const MoreSheet = dynamic(
  () => import("./nav/more-sheet").then((mod) => mod.MoreSheet),
  { ssr: false },
);
const SearchOverlay = dynamic(
  () => import("./nav/search-overlay").then((mod) => mod.SearchOverlay),
  { ssr: false },
);

export function PublicShell({ children }: { children: ReactNode }) {
  const [moreOpen, setMoreOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <div className="flex min-h-screen min-h-[100dvh] flex-col bg-[#FAFBFF] w-full">
      <DesktopHeader onOpenSearch={() => setSearchOpen(true)} />
      <MobileHeader onOpenSearch={() => setSearchOpen(true)} />
      <main
        id="main-content"
        className="flex-1 pb-20 md:pb-0 w-full focus:outline-none"
        tabIndex={-1}
      >
        {children}
      </main>
      <SiteFooter />
      <BottomTabBar onOpenMore={() => setMoreOpen(true)} moreOpen={moreOpen} />
      <MoreSheet open={moreOpen} onOpenChange={setMoreOpen} />
      <SearchOverlay isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
}
