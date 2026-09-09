"use client";

import {
  ArrowLeft,
  Layers,
  Palette,
  ShieldCheck,
  SlidersHorizontal,
  Type,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function AdminStyleGuidePage() {
  const [demoInput, setDemoInput] = useState("");

  const brandColors = [
    {
      name: "Primary Brand (Deep Navy)",
      hex: "#184098",
      token: "--color-brand-navy",
      desc: "Headers, navigation, primary buttons, footers (~70% weight)",
      textColor: "text-white",
      bgClass: "bg-[#184098]",
    },
    {
      name: "Shadow Navy (Dark Tint)",
      hex: "#08276B",
      token: "--color-brand-shadow",
      desc: "Direct from logo drop-shadow lettering; hover states & dark sections",
      textColor: "text-white",
      bgClass: "bg-[#08276B]",
    },
    {
      name: "Accent Brand (Gold)",
      hex: "#FDDA32",
      token: "--color-brand-gold",
      desc: "CTA highlights, awards moments, active states (~10-15% weight)",
      textColor: "text-[#151B2E]",
      bgClass: "bg-[#FDDA32]",
    },
    {
      name: "Deep Amber (Accessible Tint)",
      hex: "#E0B71E",
      token: "--color-brand-amber",
      desc: "WCAG AA-safe gold tone for text and borders on white surfaces",
      textColor: "text-[#151B2E]",
      bgClass: "bg-[#E0B71E]",
    },
    {
      name: "Base Background (Near-White)",
      hex: "#FAFBFF",
      token: "--color-brand-bg",
      desc: "Cool, clean page background matching logo whites",
      textColor: "text-[#151B2E]",
      bgClass: "bg-[#FAFBFF] border border-[#D9DEEC]",
    },
    {
      name: "Surface (Pure White)",
      hex: "#FFFFFF",
      token: "--color-brand-surface",
      desc: "Cards, form fields, and elevated surfaces",
      textColor: "text-[#151B2E]",
      bgClass: "bg-white border border-[#D9DEEC]",
    },
    {
      name: "Ink / Text (Charcoal Navy)",
      hex: "#151B2E",
      token: "--color-brand-ink",
      desc: "Near-black with navy undertone for crisp body reading",
      textColor: "text-white",
      bgClass: "bg-[#151B2E]",
    },
    {
      name: "Border (Cool Grey-Blue)",
      hex: "#D9DEEC",
      token: "--color-brand-border",
      desc: "Dividers, card borders, subtle grid lines",
      textColor: "text-[#151B2E]",
      bgClass: "bg-[#D9DEEC]",
    },
    {
      name: "Success (Muted Green)",
      hex: "#2E8B57",
      token: "--color-brand-success",
      desc: "Verified badge, published status, successful submissions",
      textColor: "text-white",
      bgClass: "bg-[#2E8B57]",
    },
    {
      name: "Error / Alert (Clear Red)",
      hex: "#C0392B",
      token: "--color-brand-error",
      desc: "Form errors, validation alerts, destructive actions",
      textColor: "text-white",
      bgClass: "bg-[#C0392B]",
    },
  ];

  return (
    <div className="min-h-screen bg-[#FAFBFF] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#D9DEEC] pb-6">
          <div className="flex items-center gap-4">
            <Link href="/admin/dashboard" className="relative h-12 w-36 block">
              <Image
                src="/images/brand-logo.jpg"
                alt="PortHarcourtSchools Logo"
                fill
                className="object-contain object-left"
                priority
              />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <Badge
                  variant="gold"
                  className="text-[10px] uppercase font-bold"
                >
                  Design System
                </Badge>
                <Badge
                  variant="outline"
                  className="text-[10px] uppercase font-semibold border-[#D9DEEC] bg-[#EEF2FA] text-[#184098]"
                >
                  Admin Internal
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Phase 1 Foundations — Tokens, Typography, Mobile Patterns & Base
                UI
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/admin/dashboard">
              <Button
                variant="outline"
                size="sm"
                className="h-10 text-xs border-[#D9DEEC] text-[#184098] hover:bg-[#EEF2FA]"
              >
                <ArrowLeft className="size-3.5 mr-1" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>

        {/* Section 1: Brand Color Tokens */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Palette className="size-5 text-[#184098]" />
            <h2 className="font-heading text-xl font-bold text-[#151B2E]">
              1. Brand Color Palette (Logo-Matched)
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Strictly derived from Section 7 of the architecture document. Deep
            Navy (~70%) + Gold (~10-15%) + Near-White.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {brandColors.map((c) => (
              <Card
                key={c.name}
                className="overflow-hidden border-[#D9DEEC] bg-white"
              >
                <div
                  className={`h-20 w-full flex items-end p-3 font-mono text-xs font-bold ${c.bgClass} ${c.textColor}`}
                >
                  {c.hex}
                </div>
                <CardContent className="p-4 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="font-heading text-xs font-bold text-[#151B2E]">
                      {c.name}
                    </p>
                  </div>
                  <p className="text-[11px] text-muted-foreground">{c.desc}</p>
                  <p className="text-[10px] font-mono text-muted-foreground/80 pt-1">
                    {c.token}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Section 2: Typography Scale */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Type className="size-5 text-[#184098]" />
            <h2 className="font-heading text-xl font-bold text-[#151B2E]">
              2. Typography System
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Confident geometric sans matched to the dimensional badge logo:{" "}
            <strong>Sora</strong> for headlines, <strong>Public Sans</strong>{" "}
            for body/UI, and <strong>Space Grotesk</strong> for Awards/Summit
            accents.
          </p>

          <Card className="border-[#D9DEEC] bg-white p-6 space-y-6">
            <div className="space-y-2 border-b border-[#D9DEEC] pb-4">
              <span className="text-[11px] font-mono uppercase text-muted-foreground">
                Display Headline (Sora Black / 800)
              </span>
              <h1 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-black text-[#184098]">
                Clarity for Parents. Recognition for Teachers.
              </h1>
            </div>

            <div className="space-y-2 border-b border-[#D9DEEC] pb-4">
              <span className="text-[11px] font-mono uppercase text-muted-foreground">
                Section Heading (Sora Bold / 700)
              </span>
              <h2 className="font-heading text-xl sm:text-2xl font-bold text-[#151B2E]">
                Port Harcourt Schools Directory & Editorial Insights
              </h2>
            </div>

            <div className="space-y-2 border-b border-[#D9DEEC] pb-4">
              <span className="text-[11px] font-mono uppercase text-muted-foreground">
                Awards Branding Display (Space Grotesk Bold)
              </span>
              <p className="font-display text-xl sm:text-2xl font-bold tracking-tight text-[#184098]">
                TEACHERS SPOTLIGHT SUMMIT & AWARDS 2026
              </p>
            </div>

            <div className="space-y-2">
              <span className="text-[11px] font-mono uppercase text-muted-foreground">
                Body & UI Text (Public Sans Regular / Medium)
              </span>
              <p className="text-sm sm:text-base text-[#151B2E] leading-relaxed max-w-2xl">
                PortHarcourtSchools is the definitive educational hub serving
                parents, educators, and institutions across Rivers State. Built
                mobile-first for Nigerian families connecting via smartphones.
              </p>
            </div>
          </Card>
        </section>

        {/* Section 3: Base UI Primitives */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Layers className="size-5 text-[#184098]" />
            <h2 className="font-heading text-xl font-bold text-[#151B2E]">
              3. Base UI Components (Mobile-First)
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Touch targets &ge; 44px, accessible focus rings, and responsive
            components.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Buttons Card */}
            <Card className="border-[#D9DEEC] bg-white p-5 space-y-4">
              <CardTitle className="text-sm font-bold">
                Button Variants
              </CardTitle>
              <div className="flex flex-wrap gap-2.5">
                <Button className="bg-[#184098] hover:bg-[#08276B] text-white">
                  Primary Brand
                </Button>
                <Button className="bg-[#FDDA32] hover:bg-[#E0B71E] text-[#151B2E] font-bold">
                  Gold Accent
                </Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="destructive">Destructive</Button>
              </div>

              <CardTitle className="text-sm font-bold pt-2">
                Button Sizes
              </CardTitle>
              <div className="flex flex-wrap items-center gap-2">
                <Button size="xs">Extra Small</Button>
                <Button size="sm">Small (h-7)</Button>
                <Button size="default">Default (h-8)</Button>
                <Button size="lg">Large (h-9)</Button>
              </div>
            </Card>

            {/* Badges Card */}
            <Card className="border-[#D9DEEC] bg-white p-5 space-y-4">
              <CardTitle className="text-sm font-bold">
                Badge Variants
              </CardTitle>
              <div className="flex flex-wrap gap-2">
                <Badge variant="default">Primary Navy</Badge>
                <Badge variant="gold">Gold Accent</Badge>
                <Badge variant="amber">Accessible Amber</Badge>
                <Badge variant="success">
                  <ShieldCheck className="size-3 mr-1" />
                  Verified School
                </Badge>
                <Badge variant="outline">Nursery + Primary</Badge>
                <Badge variant="destructive">Archived</Badge>
              </div>

              <CardTitle className="text-sm font-bold pt-2">
                Schools Directory Tags
              </CardTitle>
              <div className="flex flex-wrap gap-1.5">
                <Badge
                  variant="outline"
                  className="bg-[#EEF2FA] text-[#184098] border-[#D9DEEC]"
                >
                  GRA Phase 2
                </Badge>
                <Badge
                  variant="outline"
                  className="bg-[#EEF2FA] text-[#184098] border-[#D9DEEC]"
                >
                  British / Nigerian
                </Badge>
                <Badge
                  variant="outline"
                  className="bg-[#EEF2FA] text-[#184098] border-[#D9DEEC]"
                >
                  Day & Boarding
                </Badge>
                <Badge variant="gold" className="text-[10px]">
                  Featured Listing
                </Badge>
              </div>
            </Card>

            {/* Inputs & Select Card */}
            <Card className="border-[#D9DEEC] bg-white p-5 space-y-4">
              <CardTitle className="text-sm font-bold">
                Form Controls (Mobile-First &ge; 44px)
              </CardTitle>
              <div className="space-y-3">
                <div>
                  <label
                    htmlFor="style-guide-search"
                    className="text-xs font-semibold text-[#151B2E] block mb-1"
                  >
                    School Search Input
                  </label>
                  <Input
                    id="style-guide-search"
                    placeholder="Search schools by name or area..."
                    value={demoInput}
                    onChange={(e) => setDemoInput(e.target.value)}
                  />
                </div>

                <div>
                  <label
                    htmlFor="style-guide-area"
                    className="text-xs font-semibold text-[#151B2E] block mb-1"
                  >
                    Area Selector (Curated Dropdown)
                  </label>
                  <Select id="style-guide-area" defaultValue="old-gra">
                    <option value="old-gra">Old GRA (Port Harcourt)</option>
                    <option value="new-gra">New GRA (Port Harcourt)</option>
                    <option value="woji">Woji (Obio-Akpor)</option>
                    <option value="trans-amadi">
                      Trans-Amadi (Industrial)
                    </option>
                    <option value="peter-odili">Peter Odili Road</option>
                  </Select>
                </div>
              </div>
            </Card>

            {/* Modal Dialog & Mobile Sheet Drawers */}
            <Card className="border-[#D9DEEC] bg-white p-5 space-y-4">
              <CardTitle className="text-sm font-bold">
                Modals & Mobile Drawers
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Accessible dialogs and bottom/side sheets for mobile filters and
                navigation.
              </p>

              <div className="flex flex-wrap gap-3 pt-2">
                {/* Dialog Trigger */}
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="text-xs border-[#184098] text-[#184098]"
                    >
                      Open Modal Dialog
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>School Verification Dialog</DialogTitle>
                      <DialogDescription>
                        Confirm administrative verification for this institution
                        listing.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="py-2 text-xs text-muted-foreground">
                      This action sets the Verified badge visible to parents on
                      the public directory.
                    </div>
                    <DialogFooter>
                      <Button className="bg-[#184098] text-white">
                        Confirm Verification
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                {/* Bottom Sheet Trigger */}
                <Sheet>
                  <SheetTrigger asChild>
                    <Button className="bg-[#FDDA32] text-[#151B2E] font-bold text-xs hover:bg-[#E0B71E]">
                      <SlidersHorizontal className="size-3.5 mr-1" />
                      Open Filter Drawer (Bottom)
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="bottom">
                    <SheetHeader>
                      <SheetTitle>Filter Schools Directory</SheetTitle>
                      <SheetDescription>
                        Narrow listings by level, area, curriculum, and fee
                        range.
                      </SheetDescription>
                    </SheetHeader>
                    <div className="py-4 space-y-3">
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="gold">All Levels</Badge>
                        <Badge variant="outline">Nursery</Badge>
                        <Badge variant="outline">Primary</Badge>
                        <Badge variant="outline">Secondary</Badge>
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </Card>
          </div>
        </section>

        {/* Section 4: Scrollable Table Wrapper */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-5 text-[#184098]" />
            <h2 className="font-heading text-xl font-bold text-[#151B2E]">
              4. Responsive Table Wrapper (Mobile Scrollable)
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Data-dense admin tables with smooth horizontal swipe support on
            narrow viewports.
          </p>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>School Name</TableHead>
                <TableHead>Area</TableHead>
                <TableHead>Levels</TableHead>
                <TableHead>Fee Range</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-bold text-[#184098]">
                  Greenfield International Academy
                </TableCell>
                <TableCell>Old GRA</TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-[10px]">
                    Nursery + Primary + Secondary
                  </Badge>
                </TableCell>
                <TableCell>₦450,000 – ₦850,000 / term</TableCell>
                <TableCell>
                  <Badge variant="success" className="text-[10px]">
                    Verified
                  </Badge>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-bold text-[#184098]">
                  Rivers Crest Montessori
                </TableCell>
                <TableCell>Woji</TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-[10px]">
                    Nursery + Primary
                  </Badge>
                </TableCell>
                <TableCell>₦280,000 – ₦450,000 / term</TableCell>
                <TableCell>
                  <Badge variant="amber" className="text-[10px]">
                    In Review
                  </Badge>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </section>
      </div>
    </div>
  );
}
