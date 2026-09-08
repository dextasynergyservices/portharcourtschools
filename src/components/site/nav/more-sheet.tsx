"use client";

import {
  ChevronRight,
  Handshake,
  Info,
  Mail,
  MessageSquare,
  Phone,
  Send,
  X,
} from "lucide-react";
import { AnimatePresence, motion, type PanInfo } from "motion/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface MoreSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MoreSheet({ open, onOpenChange }: MoreSheetProps) {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  // Prevent background scrolling when drawer is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setTimeout(() => {
        setEmail("");
        setSubscribed(false);
      }, 3000);
    }
  };

  const handleDragEnd = (
    _event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo,
  ) => {
    // If pulled down more than 80px or with downward velocity, dismiss
    if (info.offset.y > 80 || info.velocity.y > 300) {
      onOpenChange(false);
    }
  };

  const navLinks: Array<{
    title: string;
    description: string;
    href: string;
    icon: typeof Info;
    badge?: string;
  }> = [
    {
      title: "Contact & Inquiries",
      description: "Direct lines for parents, teachers, and school proprietors",
      href: "/contact",
      icon: Mail,
      badge: "Let's Talk",
    },
    {
      title: "About Us",
      description: "Our mission, vision, and the EdFocus Africa story",
      href: "/about",
      icon: Info,
    },
    {
      title: "Partners & Sponsors",
      description: "Partner with our summit, programmes, and directory",
      href: "/partners",
      icon: Handshake,
    },
  ];

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 md:hidden flex flex-col justify-end">
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => onOpenChange(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
          />

          {/* Draggable Drawer Panel */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            drag="y"
            dragConstraints={{ top: 0 }}
            dragElastic={{ top: 0, bottom: 0.5 }}
            onDragEnd={handleDragEnd}
            className="relative z-10 w-full max-h-[88vh] flex flex-col bg-white rounded-t-3xl border-t border-[#D9DEEC] shadow-2xl safe-bottom touch-none"
          >
            {/* Pill Drag Handle */}
            <div className="w-full pt-3 pb-2 flex items-center justify-center cursor-grab active:cursor-grabbing">
              <div className="w-12 h-1.5 rounded-full bg-[#184098]/30" />
            </div>

            <div className="overflow-y-auto px-5 pb-6 pt-1 touch-auto space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-[#D9DEEC]">
                <span className="font-heading font-bold text-[#184098] text-sm tracking-tight">
                  Menu &amp; Resources
                </span>

                <button
                  type="button"
                  onClick={() => onOpenChange(false)}
                  aria-label="Close menu"
                  className="flex size-8 items-center justify-center rounded-full bg-[#EEF2FA] text-[#184098] hover:bg-[#D9DEEC] transition-colors"
                >
                  <X className="size-4" />
                </button>
              </div>

              {/* Links Grid */}
              <div className="space-y-1">
                {navLinks.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => onOpenChange(false)}
                      className="flex items-center justify-between p-3 rounded-xl hover:bg-[#EEF2FA] transition-colors group touch-target"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#EEF2FA] text-[#184098] group-hover:bg-[#184098] group-hover:text-[#FDDA32] transition-colors">
                          <Icon className="size-4.5" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-heading text-sm font-bold text-[#151B2E] truncate">
                              {item.title}
                            </p>
                            {item.badge && (
                              <Badge
                                variant="outline"
                                className="text-[9px] py-0 px-1.5 border-[#D9DEEC] bg-[#EEF2FA] text-[#184098] font-bold"
                              >
                                {item.badge}
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground truncate">
                            {item.description}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="size-4 text-muted-foreground group-hover:text-[#184098] transition-colors shrink-0 ml-2" />
                    </Link>
                  );
                })}
              </div>

              {/* Quick Contact Reach Card */}
              <div className="rounded-2xl border border-[#D9DEEC] bg-[#F5F4F0] p-4 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-heading text-xs font-bold text-[#151B2E] uppercase tracking-wider">
                    Quick Reach
                  </span>
                  <Link
                    href="/contact"
                    onClick={() => onOpenChange(false)}
                    className="text-[11px] font-bold text-[#184098] hover:underline flex items-center gap-0.5"
                  >
                    <span>Full Contact Desk</span>
                    <ChevronRight className="size-3" />
                  </Link>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <a
                    href="https://wa.me/2348120000000"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-white border border-emerald-200 text-emerald-700 text-xs font-bold shadow-2xs hover:bg-emerald-50 transition-colors"
                  >
                    <MessageSquare className="size-3.5" />
                    <span>WhatsApp</span>
                  </a>
                  <a
                    href="tel:+2348120000000"
                    className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-white border border-[#D9DEEC] text-[#151B2E] text-xs font-bold shadow-2xs hover:bg-[#EEF2FA] transition-colors"
                  >
                    <Phone className="size-3.5" />
                    <span>Call Us</span>
                  </a>
                </div>
              </div>

              {/* Community Newsletter Capture Box */}
              <div className="rounded-2xl border border-[#D9DEEC] bg-[#FAFBFF] p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Mail className="size-4 text-[#184098]" />
                  <h4 className="font-heading text-xs font-bold text-[#184098]">
                    Join the Education Community
                  </h4>
                </div>
                <p className="text-[11px] text-muted-foreground mb-3">
                  Receive verified school updates, parenting guides, and event
                  alerts.
                </p>

                {subscribed ? (
                  <div className="rounded-lg bg-[#2E8B57]/10 p-2.5 text-center text-xs font-semibold text-[#2E8B57]">
                    ✓ You are on the community list!
                  </div>
                ) : (
                  <form onSubmit={handleSubscribe} className="flex gap-2">
                    <Input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="h-10 text-xs bg-white border-[#D9DEEC] focus-visible:ring-[#184098]"
                    />
                    <Button
                      type="submit"
                      size="sm"
                      className="h-10 bg-[#184098] text-white hover:bg-[#08276B] px-3 font-bold text-xs shrink-0"
                    >
                      <Send className="size-3.5 mr-1" />
                      Join
                    </Button>
                  </form>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
