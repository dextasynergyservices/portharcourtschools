"use client";

import {
  Award,
  BookOpen,
  Calendar,
  FileText,
  GraduationCap,
  Image as ImageIcon,
  Inbox,
  LayoutDashboard,
  Menu,
  School,
  Settings,
  Users,
} from "lucide-react";
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
  { name: "Events & Awards", href: "/admin/events", icon: Calendar },
  { name: "Programmes", href: "/admin/programmes", icon: Award },
  { name: "Submissions", href: "/admin/submissions", icon: Inbox },
  { name: "Pages & Content", href: "/admin/pages", icon: FileText },
  { name: "Media Library", href: "/admin/media", icon: ImageIcon },
  { name: "Team & Roles", href: "/admin/users", icon: Users },
  { name: "Settings", href: "/admin/settings", icon: Settings },
];

export function DashboardShell({ user, children }: DashboardShellProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const NavLinks = ({ onClick }: { onClick?: () => void }) => (
    <nav className="flex flex-col space-y-1">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;
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
              className={`size-4.5 shrink-0 ${isActive ? "text-[#FDDA32]" : ""}`}
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
      <aside className="hidden md:flex md:w-64 md:flex-col border-r border-[#D9DEEC] bg-white">
        {/* Brand Header */}
        <div className="flex h-16 items-center gap-2.5 border-b border-[#D9DEEC] px-6">
          <div className="flex size-9 items-center justify-center rounded-lg bg-[#184098] text-[#FDDA32]">
            <GraduationCap className="size-5" />
          </div>
          <div>
            <span className="font-heading text-sm font-bold text-[#184098] tracking-tight block">
              PortHarcourtSchools
            </span>
            <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
              Admin Console
            </span>
          </div>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          <NavLinks />
        </div>

        {/* User profile footer */}
        <div className="border-t border-[#D9DEEC] p-4 bg-[#FAFBFF]">
          <div className="mb-3 flex items-center justify-between">
            <div className="min-w-0">
              <p className="truncate text-xs font-bold text-[#151B2E]">
                {user.name || "Administrator"}
              </p>
              <p className="truncate text-[11px] text-muted-foreground">
                {user.email}
              </p>
            </div>
            <Badge variant="gold" className="text-[10px] capitalize">
              {user.role || "Admin"}
            </Badge>
          </div>
          <SignOutButton className="w-full justify-start text-xs text-muted-foreground hover:text-destructive h-9" />
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Mobile Header (< md) */}
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-[#D9DEEC] bg-white px-4 md:hidden">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-[#184098] text-[#FDDA32]">
              <GraduationCap className="size-4" />
            </div>
            <span className="font-heading text-sm font-bold text-[#184098]">
              PHSchools Admin
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="gold" className="text-[10px] capitalize">
              {user.role || "Admin"}
            </Badge>

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
                  <div className="flex items-center gap-2">
                    <div className="flex size-8 items-center justify-center rounded-lg bg-[#184098] text-[#FDDA32]">
                      <GraduationCap className="size-4" />
                    </div>
                    <div>
                      <SheetTitle className="text-sm font-bold text-[#184098]">
                        PortHarcourtSchools
                      </SheetTitle>
                      <SheetDescription className="text-[10px] uppercase font-bold text-muted-foreground">
                        Admin Menu
                      </SheetDescription>
                    </div>
                  </div>
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
