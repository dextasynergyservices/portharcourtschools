"use client";

import { MapPin, Send } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function SiteFooter() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setTimeout(() => {
        setEmail("");
        setSubscribed(false);
      }, 3500);
    }
  };

  return (
    <footer className="w-full border-t border-[#002c8c] bg-[#002c8c] text-white pt-14 pb-24 md:pb-14 safe-bottom">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-white/10">
          {/* Col 1 & 2: Brand & Mission */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="inline-block group">
              <Image
                src="/images/brand-logo.jpg"
                alt="PortHarcourtSchools"
                width={160}
                height={50}
                className="h-12 w-auto object-contain rounded transition-transform group-hover:scale-[1.02]"
              />
            </Link>

            <p className="text-xs sm:text-sm text-[#D9DEEC] leading-relaxed max-w-sm">
              The premier education media platform for Rivers State. Empowering
              parents with clarity, recognizing outstanding educators, and
              building credible channels for educational investment.
            </p>

            <div className="flex items-center gap-2 pt-2">
              <Badge
                variant="outline"
                className="text-[10px] uppercase font-bold border-white/20 bg-white/10 text-white"
              >
                NDPA 2023 Compliant
              </Badge>
              <span className="text-[11px] text-[#D9DEEC]/80 flex items-center gap-1">
                <MapPin className="size-3 text-[#fcda04]" />
                Port Harcourt, Nigeria
              </span>
            </div>
          </div>

          {/* Col 3: Schools Directory */}
          <div className="space-y-3">
            <h4 className="font-heading text-xs font-bold uppercase tracking-wider text-[#fcda04]">
              Schools Directory
            </h4>
            <ul className="space-y-2 text-xs text-[#D9DEEC]">
              <li>
                <Link
                  href="/schools?level=nursery"
                  className="hover:text-white transition-colors"
                >
                  Nursery Schools
                </Link>
              </li>
              <li>
                <Link
                  href="/schools?level=primary"
                  className="hover:text-white transition-colors"
                >
                  Primary Schools
                </Link>
              </li>
              <li>
                <Link
                  href="/schools?level=secondary"
                  className="hover:text-white transition-colors"
                >
                  Secondary Schools
                </Link>
              </li>
              <li>
                <Link
                  href="/schools?area=old-gra"
                  className="hover:text-white transition-colors"
                >
                  GRA & Old GRA Schools
                </Link>
              </li>
              <li>
                <Link
                  href="/schools?area=woji"
                  className="hover:text-white transition-colors"
                >
                  Woji & Peter Odili Schools
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Platform Initiatives */}
          <div className="space-y-3">
            <h4 className="font-heading text-xs font-bold uppercase tracking-wider text-[#FDDA32]">
              Initiatives & Editorial
            </h4>
            <ul className="space-y-2 text-xs text-[#D9DEEC]">
              <li>
                <Link
                  href="/blog"
                  className="hover:text-white transition-colors"
                >
                  Parent Corner Insights
                </Link>
              </li>
              <li>
                <Link
                  href="/blog?category=teacher-leadership"
                  className="hover:text-white transition-colors"
                >
                  School Leadership Watch
                </Link>
              </li>
              <li>
                <Link
                  href="/events"
                  className="hover:text-white transition-colors"
                >
                  Teachers Spotlight Summit 2026
                </Link>
              </li>
              <li>
                <Link
                  href="/partners"
                  className="hover:text-white transition-colors"
                >
                  Partner / Sponsor With Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 5: Community Capture */}
          <div className="space-y-3">
            <h4 className="font-heading text-xs font-bold uppercase tracking-wider text-[#fcda04]">
              Stay Informed
            </h4>
            <p className="text-xs text-[#D9DEEC]">
              Get school admission notifications, curriculum analysis, and
              community guides.
            </p>

            {subscribed ? (
              <div className="rounded-lg bg-[#2E8B57]/30 border border-[#2E8B57] p-2.5 text-center text-xs font-semibold text-white">
                ✓ Welcome to the community!
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-2">
                <Input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="parent@example.com"
                  className="h-10 text-xs bg-white/10 border-white/20 text-white placeholder:text-white/50 focus-visible:ring-[#fcda04]"
                />
                <Button
                  type="submit"
                  size="sm"
                  className="w-full h-10 bg-[#fcda04] text-[#002c8c] hover:bg-[#e6c500] font-bold text-xs"
                >
                  <Send className="size-3.5 mr-1" />
                  Join Newsletter
                </Button>
              </form>
            )}
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#D9DEEC]/70">
          <p>
            © {new Date().getFullYear()} PortHarcourtSchools. Built by{" "}
            <a
              href="https://www.dexta.services"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#fcda04] hover:underline font-bold transition-colors"
            >
              DEXTA
            </a>
            . All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link href="/about" className="hover:text-white transition-colors">
              About
            </Link>
            <Link
              href="/partners"
              className="hover:text-white transition-colors"
            >
              Partners
            </Link>
            <Link
              href="/contact"
              className="hover:text-white transition-colors"
            >
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
