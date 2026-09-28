"use client";

import {
  Award,
  BookOpen,
  Calendar,
  ExternalLink,
  FileText,
  Handshake,
  Image as ImageIcon,
  Inbox,
  LayoutDashboard,
  Menu,
  Palette,
  School,
  Settings,
  Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import logoImg from "../../../../../public/images/logo.png";
import { SignOutButton } from "./sign-out-button";

interface DashboardShellProps {
  user: {
    name?: string | null;
    email?: string | null;
    role?: string;
  };
  children: ReactNode;
}

const NAV_ITEMS = [
  { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { name: "Schools Directory", href: "/admin/schools", icon: School },
  { name: "Blog Posts", href: "/admin/posts", icon: BookOpen },
  { name: "Events", href: "/admin/events", icon: Calendar },
  { name: "Programmes", href: "/admin/programmes", icon: Award },
  { name: "Partners", href: "/admin/partners", icon: Handshake },
  { name: "Submissions", href: "/admin/submissions", icon: Inbox },
  { name: "Pages & Content", href: "/admin/pages", icon: FileText },
  { name: "Media Library", href: "/admin/media", icon: ImageIcon },
  { name: "Team & Roles", href: "/admin/users", icon: Users },
  { name: "Style Guide", href: "/admin/style-guide", icon: Palette },
  { name: "Settings", href: "/admin/settings", icon: Settings },
];

export function DashboardShell({ user, children }: DashboardShellProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const NavLinks = ({ onClick }: { onClick?: () => void }) => (
    <nav className="flex flex-col space-y-1">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive =
          pathname === item.href ||
          (item.href !== "/admin/dashboard" &&
            pathname.startsWith(`${item.href}/`));
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onClick}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors touch-target ${
              isActive
                ? "bg-[#184098] text-white shadow-xs font-semibold"
                : "text-muted-foreground hover:bg-[#EEF2FA] hover:text-[#184098]"
            }`}
          >
            <Icon
              className={`size-4.5 shrink-0 ${isActive ? "text-white" : ""}`}
            />
            <span>{item.name}</span>
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="flex min-h-screen bg-[#FAFBFF]">
      {/* Desktop Sidebar (hidden on mobile, visible on md+) */}
      <aside className="hidden md:flex md:w-64 md:flex-col border-r border-[#D9DEEC] bg-white shrink-0">
        {/* Brand Header */}
        <div className="flex h-20 items-center px-5 border-b border-[#D9DEEC]">
          <Link
            href="/admin/dashboard"
            className="flex items-center group py-1"
          >
            <Image
              src={logoImg}
              alt="Schools Voice Logo"
              priority
              loading="eager"
              className="h-14 w-auto object-contain transition-transform group-hover:scale-[1.02]"
            />
          </Link>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          <NavLinks />
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Desktop Top Header (hidden on mobile, visible on md+) */}
        <header className="sticky top-0 z-30 hidden md:flex h-20 items-center justify-between border-b border-[#D9DEEC] bg-white px-6">
          <div className="flex items-center gap-3">
            <span className="font-heading font-bold text-sm text-[#151B2E]">
              Admin Portal
            </span>
            <span className="text-muted-foreground/40">•</span>
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-[#184098] transition-colors"
            >
              <ExternalLink className="size-3.5" />
              <span>View Live Site</span>
            </a>
          </div>

          <div className="flex items-center gap-4">
            {/* User Profile Block */}
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-full bg-[#184098] text-white text-xs font-bold uppercase tracking-wider shadow-xs">
                {user.name ? user.name.slice(0, 2) : "AD"}
              </div>
              <div className="text-left">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#151B2E] leading-none">
                    {user.name || "Administrator"}
                  </span>
                  <Badge
                    variant="outline"
                    className="text-[10px] capitalize font-medium border-[#D9DEEC] bg-[#EEF2FA] text-[#184098] py-0 px-1.5 h-4"
                  >
                    {user.role?.replace("_", " ") || "Admin"}
                  </Badge>
                </div>
                <span className="text-[11px] text-muted-foreground leading-tight block mt-0.5">
                  {user.email}
                </span>
              </div>
            </div>

            <div className="h-6 w-px bg-[#D9DEEC]" />

            {/* Sign Out Button */}
            <SignOutButton
              variant="outline"
              className="h-8 text-xs border-[#D9DEEC] text-muted-foreground hover:text-red-600 hover:border-red-200 hover:bg-red-50 font-medium px-3 transition-colors"
            />
          </div>
        </header>

        {/* Mobile Header (< md) */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[#D9DEEC] bg-white px-4 md:hidden">
          <Link
            href="/admin/dashboard"
            className="flex items-center group py-1"
          >
            <Image
              src={logoImg}
              alt="Schools Voice Logo"
              priority
              loading="eager"
              className="h-11 w-auto object-contain"
            />
          </Link>

          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="text-[10px] capitalize border-[#D9DEEC] bg-[#EEF2FA] text-[#184098]"
            >
              {user.role?.replace("_", " ") || "Admin"}
            </Badge>

            <SignOutButton
              variant="ghost"
              className="h-8 text-xs p-1.5 text-muted-foreground hover:text-red-600"
            />

            {/* Mobile Navigation Drawer Trigger */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="size-9 p-0 touch-target text-[#184098]"
                  aria-label="Open navigation menu"
                >
                  <Menu className="size-5" />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="left"
                className="w-[280px] p-0 flex flex-col bg-white"
              >
                <SheetHeader className="border-b border-[#D9DEEC] p-4 text-left">
                  <div className="flex items-center justify-between">
                    <Link
                      href="/admin/dashboard"
                      className="flex items-center group py-1"
                    >
                      <Image
                        src={logoImg}
                        alt="Schools Voice Logo"
                        className="h-11 w-auto object-contain"
                      />
                    </Link>
                    <Badge
                      variant="outline"
                      className="text-[9px] uppercase tracking-wider font-bold border-[#D9DEEC] bg-[#EEF2FA] text-[#184098]"
                    >
                      Admin
                    </Badge>
                  </div>
                  <SheetTitle className="sr-only">Admin Navigation</SheetTitle>
                  <SheetDescription className="sr-only">
                    Administrative navigation menu
                  </SheetDescription>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto px-3 py-4">
                  <NavLinks onClick={() => setMobileOpen(false)} />
                </div>

                <div className="border-t border-[#D9DEEC] p-4 bg-[#FAFBFF]">
                  <div className="mb-3">
                    <p className="truncate text-xs font-bold text-[#151B2E]">
                      {user.name || "Administrator"}
                    </p>
                    <p className="truncate text-[11px] text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                  <SignOutButton className="w-full justify-start text-xs text-muted-foreground hover:text-destructive h-9" />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
