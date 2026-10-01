"use client";

import {
  AlertCircle,
  Building,
  Check,
  DollarSign,
  FolderOpen,
  Globe,
  GraduationCap,
  Image as ImageIcon,
  Loader2,
  MapPin,
  Phone,
  Plus,
  Trash2,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { type ChangeEvent, useState, useTransition } from "react";
import { toast } from "sonner";
import { MediaLibraryDrawer } from "@/components/admin/media/media-library-drawer";
import { SectionImageUpload } from "@/components/admin/media/section-image-upload";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { normalizeImageUrl } from "@/lib/utils";
import {
  checkSchoolSlugAvailabilityAction,
  createSchoolAction,
  type SchoolActionState,
  updateSchoolAction,
} from "./actions";

interface AreaOption {
  id: string;
  name: string;
  slug: string;
  lga: string;
}

interface SchoolFormProps {
  initialData?: {
    id: string;
    slug: string;
    name: string;
    levels: string[];
    schoolType: "private" | "public" | "faith_based" | "international";
    curriculum: "nigerian" | "british" | "american" | "ib" | "mixed";
    gender: "co_ed" | "boys" | "girls";
    boardingType: "day" | "boarding" | "both";
    address: string | null;
    areaId: string | null;
    lga: string | null;
    phone: string | null;
    whatsapp: string | null;
    email: string | null;
    website: string | null;
    socials: {
      instagram?: string;
      facebook?: string;
      x?: string;
      tiktok?: string;
    } | null;
    feeMin: number | null;
    feeMax: number | null;
    feePeriod: "per_term" | "per_session";
    feeVisibility: "exact" | "band_only" | "on_request" | "hidden";
    logo: string | null;
    coverImage: string | null;
    gallery: string[] | null;
    description: string | null;
    verified: boolean;
    featured: boolean;
    status: "draft" | "published" | "archived";
  };
  areas: AreaOption[];
}

const AVAILABLE_LEVELS = [
  "Creche / Daycare",
  "Nursery / Early Years",
  "Primary / Elementary",
  "Junior Secondary (JSS 1–3)",
  "Senior Secondary (SSS 1–3)",
  "Sixth Form / A-Levels",
];

export function SchoolForm({ initialData, areas }: SchoolFormProps) {
  const router = useRouter();
  const isEditing = Boolean(initialData);

  const [activeTab, setActiveTab] = useState<
    | "identity"
    | "classification"
    | "location"
    | "contact"
    | "fees"
    | "media"
    | "publishing"
  >("identity");

  // Form State
  const [name, setName] = useState(initialData?.name || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(
    Boolean(initialData),
  );
  const [isSlugChecking, setIsSlugChecking] = useState(false);
  const [isSlugAvailable, setIsSlugAvailable] = useState<boolean | null>(null);

  const [levels, setLevels] = useState<string[]>(
    initialData?.levels || ["Primary / Elementary"],
  );
  const [schoolType, setSchoolType] = useState(
    initialData?.schoolType || "private",
  );
  const [curriculum, setCurriculum] = useState(
    initialData?.curriculum || "nigerian",
  );
  const [gender, setGender] = useState(initialData?.gender || "co_ed");
  const [boardingType, setBoardingType] = useState(
    initialData?.boardingType || "day",
  );

  const [areaId, setAreaId] = useState(
    initialData?.areaId || areas[0]?.id || "",
  );
  const [address, setAddress] = useState(initialData?.address || "");
  const [lga, setLga] = useState(initialData?.lga || "Port Harcourt");

  const [phone, setPhone] = useState(initialData?.phone || "");
  const [whatsapp, setWhatsapp] = useState(initialData?.whatsapp || "");
  const [email, setEmail] = useState(initialData?.email || "");
  const [website, setWebsite] = useState(initialData?.website || "");
  const [instagram, setInstagram] = useState(
    initialData?.socials?.instagram || "",
  );
  const [facebook, setFacebook] = useState(
    initialData?.socials?.facebook || "",
  );
  const [xSocial, setXSocial] = useState(initialData?.socials?.x || "");

  // Fees with formatted live previews
  const [feeMin, setFeeMin] = useState<number | "">(
    initialData?.feeMin !== null && initialData?.feeMin !== undefined
      ? initialData.feeMin
      : "",
  );
  const [feeMax, setFeeMax] = useState<number | "">(
    initialData?.feeMax !== null && initialData?.feeMax !== undefined
      ? initialData.feeMax
      : "",
  );
  const [feePeriod, setFeePeriod] = useState<"per_term" | "per_session">(
    initialData?.feePeriod || "per_term",
  );
  const [feeVisibility, setFeeVisibility] = useState<
    "exact" | "band_only" | "on_request" | "hidden"
  >(initialData?.feeVisibility || "band_only");

  // Media
  const [logo, setLogo] = useState(initialData?.logo || "");
  const [coverImage, setCoverImage] = useState(initialData?.coverImage || "");
  const [gallery, setGallery] = useState<string[]>(initialData?.gallery || []);
  const [newGalleryUrl, setNewGalleryUrl] = useState("");
  const [isGalleryDrawerOpen, setIsGalleryDrawerOpen] = useState(false);

  const [description, setDescription] = useState(
    initialData?.description || "",
  );
  const [verified, setVerified] = useState(initialData?.verified || false);
  const [featured, setFeatured] = useState(initialData?.featured || false);
  const [status, setStatus] = useState<"draft" | "published" | "archived">(
    initialData?.status || "draft",
  );

  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Auto-slug generator
  const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    if (!isSlugManuallyEdited) {
      const generated = val
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-");
      setSlug(generated);
      checkSlug(generated);
    }
  };

  const checkSlug = async (candidateSlug: string) => {
    if (!candidateSlug || candidateSlug.length < 2) {
      setIsSlugAvailable(null);
      return;
    }
    setIsSlugChecking(true);
    try {
      const res = await checkSchoolSlugAvailabilityAction(
        candidateSlug,
        initialData?.id,
      );
      setIsSlugAvailable(res.available);
    } catch {
      setIsSlugAvailable(null);
    } finally {
      setIsSlugChecking(false);
    }
  };

  const handleSlugChange = (e: ChangeEvent<HTMLInputElement>) => {
    setIsSlugManuallyEdited(true);
    const val = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "");
    setSlug(val);
    checkSlug(val);
  };

  const toggleLevel = (lvl: string) => {
    setLevels((prev) =>
      prev.includes(lvl) ? prev.filter((item) => item !== lvl) : [...prev, lvl],
    );
  };

  const handleAddGalleryImage = () => {
    if (newGalleryUrl.trim() && !gallery.includes(newGalleryUrl.trim())) {
      setGallery([...gallery, newGalleryUrl.trim()]);
      setNewGalleryUrl("");
    }
  };

  const handleRemoveGalleryImage = (idx: number) => {
    setGallery(gallery.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (levels.length === 0) {
      setError("Please select at least one educational level.");
      setActiveTab("classification");
      return;
    }

    startTransition(async () => {
      const formData = new FormData();
      formData.set("name", name.trim());
      formData.set("slug", slug.trim());
      formData.set("schoolType", schoolType);
      formData.set("curriculum", curriculum);
      formData.set("gender", gender);
      formData.set("boardingType", boardingType);

      for (const lvl of levels) {
        formData.append("levels", lvl);
      }

      if (areaId) formData.set("areaId", areaId);
      if (address) formData.set("address", address.trim());
      if (lga) formData.set("lga", lga.trim());

      if (phone) formData.set("phone", phone.trim());
      if (whatsapp) formData.set("whatsapp", whatsapp.trim());
      if (email) formData.set("email", email.trim());
      if (website) formData.set("website", website.trim());
      if (instagram) formData.set("social_instagram", instagram.trim());
      if (facebook) formData.set("social_facebook", facebook.trim());
      if (xSocial) formData.set("social_x", xSocial.trim());

      if (feeMin !== "") formData.set("feeMin", String(feeMin));
      if (feeMax !== "") formData.set("feeMax", String(feeMax));
      formData.set("feePeriod", feePeriod);
      formData.set("feeVisibility", feeVisibility);

      if (logo) formData.set("logo", logo.trim());
      if (coverImage) formData.set("coverImage", coverImage.trim());
      formData.set("gallery", JSON.stringify(gallery));

      if (description) formData.set("description", description.trim());
      formData.set("verified", String(verified));
      formData.set("featured", String(featured));
      formData.set("status", status);

      let res: SchoolActionState;
      if (isEditing && initialData) {
        res = await updateSchoolAction(initialData.id, {}, formData);
      } else {
        res = await createSchoolAction({}, formData);
      }

      if (res.error) {
        setError(res.error);
        toast.error("Failed to save school", {
          description: res.error,
        });
      } else {
        toast.success(
          initialData?.id
            ? "School profile updated successfully"
            : "New school listing created successfully",
        );
        router.push("/admin/schools");
        router.refresh();
      }
    });
  };

  const tabs = [
    { id: "identity", label: "Identity & Bio", icon: Building },
    { id: "classification", label: "Classification", icon: GraduationCap },
    { id: "location", label: "Location", icon: MapPin },
    { id: "contact", label: "Contact & Socials", icon: Phone },
    { id: "fees", label: "Fees in Naira", icon: DollarSign },
    { id: "media", label: "Media & Gallery", icon: ImageIcon },
    { id: "publishing", label: "Publishing", icon: Globe },
  ] as const;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs flex items-center gap-2">
          <AlertCircle className="size-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 border-b border-[#D9DEEC] text-xs">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-md font-bold whitespace-nowrap transition-colors touch-target ${
                isActive
                  ? "bg-[#184098] text-white shadow-xs"
                  : "text-muted-foreground hover:bg-[#EEF2FA] hover:text-[#184098]"
              }`}
            >
              <Icon className="size-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 1. Identity Tab */}
      {activeTab === "identity" && (
        <Card className="p-5 bg-white border-[#D9DEEC] rounded-lg shadow-xs space-y-4">
          <div className="space-y-1.5">
            <label
              htmlFor="school-name"
              className="text-xs font-bold text-[#151B2E] uppercase tracking-wider block"
            >
              School Name <span className="text-red-500">*</span>
            </label>
            <Input
              id="school-name"
              value={name}
              onChange={handleNameChange}
              placeholder="e.g. Graceland International School"
              required
              className="text-sm h-11 border-[#D9DEEC]"
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="school-slug"
              className="text-xs font-bold text-[#151B2E] uppercase tracking-wider flex items-center justify-between"
            >
              <span>
                Directory Slug (URL) <span className="text-red-500">*</span>
              </span>
              {isSlugChecking ? (
                <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                  <Loader2 className="size-3 animate-spin" /> Checking...
                </span>
              ) : isSlugAvailable === true ? (
                <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                  <Check className="size-3" /> Available
                </span>
              ) : isSlugAvailable === false ? (
                <span className="text-[11px] text-red-600 font-bold">
                  Already Taken
                </span>
              ) : null}
            </label>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground font-mono bg-[#FAFBFF] px-2.5 py-2.5 rounded border border-[#D9DEEC] shrink-0">
                /schools/
              </span>
              <Input
                id="school-slug"
                value={slug}
                onChange={handleSlugChange}
                placeholder="graceland-international-school"
                required
                className="text-sm h-11 border-[#D9DEEC] font-mono"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="school-desc"
              className="text-xs font-bold text-[#151B2E] uppercase tracking-wider block"
            >
              About / Overview Narrative
            </label>
            <Textarea
              id="school-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detailed description of the school, academic philosophy, facilities, achievements, and admissions ethos..."
              rows={6}
              className="text-xs border-[#D9DEEC] leading-relaxed"
            />
          </div>
        </Card>
      )}

      {/* 2. Classification Tab */}
      {activeTab === "classification" && (
        <Card className="p-5 bg-white border-[#D9DEEC] rounded-lg shadow-xs space-y-5">
          {/* Levels Multi-select Checkbox Group */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-[#151B2E] uppercase tracking-wider block">
              Educational Levels Provided{" "}
              <span className="text-red-500">*</span>
              <span className="text-muted-foreground font-normal text-[11px] ml-1">
                (Select all that apply)
              </span>
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 pt-1">
              {AVAILABLE_LEVELS.map((lvl) => {
                const isSelected = levels.includes(lvl);
                return (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => toggleLevel(lvl)}
                    className={`flex items-center gap-2.5 p-3 rounded-lg border text-left text-xs font-medium transition-all ${
                      isSelected
                        ? "border-[#184098] bg-[#EEF2FA] text-[#184098] font-bold shadow-xs"
                        : "border-[#D9DEEC] hover:bg-[#FAFBFF] text-[#151B2E]"
                    }`}
                  >
                    <div
                      className={`size-4 rounded flex items-center justify-center border transition-colors ${
                        isSelected
                          ? "bg-[#184098] border-[#184098] text-white"
                          : "border-[#D9DEEC] bg-white"
                      }`}
                    >
                      {isSelected && <Check className="size-3" />}
                    </div>
                    <span>{lvl}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-2 border-t border-[#D9DEEC]/60">
            {/* School Type */}
            <div className="space-y-1.5">
              <label
                htmlFor="school-category"
                className="text-xs font-bold text-[#151B2E] uppercase tracking-wider block"
              >
                Category
              </label>
              <select
                id="school-category"
                value={schoolType}
                onChange={(e) =>
                  setSchoolType(e.target.value as typeof schoolType)
                }
                className="w-full h-10 text-xs border border-[#D9DEEC] rounded-md px-3 bg-white text-[#151B2E] focus:ring-1 focus:ring-[#184098]"
              >
                <option value="private">Private Independent</option>
                <option value="international">International</option>
                <option value="faith_based">Faith-based / Mission</option>
                <option value="public">Public / Government</option>
              </select>
            </div>

            {/* Curriculum */}
            <div className="space-y-1.5">
              <label
                htmlFor="school-curriculum"
                className="text-xs font-bold text-[#151B2E] uppercase tracking-wider block"
              >
                Curriculum
              </label>
              <select
                id="school-curriculum"
                value={curriculum}
                onChange={(e) =>
                  setCurriculum(e.target.value as typeof curriculum)
                }
                className="w-full h-10 text-xs border border-[#D9DEEC] rounded-md px-3 bg-white text-[#151B2E] focus:ring-1 focus:ring-[#184098]"
              >
                <option value="nigerian">Nigerian National Curriculum</option>
                <option value="british">British / Cambridge</option>
                <option value="american">American</option>
                <option value="ib">International Baccalaureate (IB)</option>
                <option value="mixed">Dual / Mixed (Nigerian & British)</option>
              </select>
            </div>

            {/* Gender */}
            <div className="space-y-1.5">
              <label
                htmlFor="school-gender"
                className="text-xs font-bold text-[#151B2E] uppercase tracking-wider block"
              >
                Gender Structure
              </label>
              <select
                id="school-gender"
                value={gender}
                onChange={(e) => setGender(e.target.value as typeof gender)}
                className="w-full h-10 text-xs border border-[#D9DEEC] rounded-md px-3 bg-white text-[#151B2E] focus:ring-1 focus:ring-[#184098]"
              >
                <option value="co_ed">Co-educational (Mixed)</option>
                <option value="boys">All Boys</option>
                <option value="girls">All Girls</option>
              </select>
            </div>

            {/* Boarding Type */}
            <div className="space-y-1.5">
              <label
                htmlFor="school-boarding"
                className="text-xs font-bold text-[#151B2E] uppercase tracking-wider block"
              >
                Boarding Facility
              </label>
              <select
                id="school-boarding"
                value={boardingType}
                onChange={(e) =>
                  setBoardingType(e.target.value as typeof boardingType)
                }
                className="w-full h-10 text-xs border border-[#D9DEEC] rounded-md px-3 bg-white text-[#151B2E] focus:ring-1 focus:ring-[#184098]"
              >
                <option value="day">Day Only</option>
                <option value="boarding">Full Boarding Only</option>
                <option value="both">Day &amp; Boarding Options</option>
              </select>
            </div>
          </div>
        </Card>
      )}

      {/* 3. Location Tab */}
      {activeTab === "location" && (
        <Card className="p-5 bg-white border-[#D9DEEC] rounded-lg shadow-xs space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Curated Area Dropdown */}
            <div className="space-y-1.5">
              <label
                htmlFor="school-area"
                className="text-xs font-bold text-[#151B2E] uppercase tracking-wider block"
              >
                Port Harcourt Neighbourhood / Area{" "}
                <span className="text-red-500">*</span>
              </label>
              <select
                id="school-area"
                value={areaId}
                onChange={(e) => {
                  setAreaId(e.target.value);
                  const matched = areas.find((a) => a.id === e.target.value);
                  if (matched) setLga(matched.lga);
                }}
                required
                className="w-full h-10 text-xs border border-[#D9DEEC] rounded-md px-3 bg-white text-[#151B2E] focus:ring-1 focus:ring-[#184098] font-medium"
              >
                {areas.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({a.lga})
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-muted-foreground">
                Managed list of curated Port Harcourt districts for reliable
                filtering.
              </p>
            </div>

            {/* LGA */}
            <div className="space-y-1.5">
              <label
                htmlFor="school-lga"
                className="text-xs font-bold text-[#151B2E] uppercase tracking-wider block"
              >
                Local Government Area (LGA)
              </label>
              <Input
                id="school-lga"
                value={lga}
                onChange={(e) => setLga(e.target.value)}
                placeholder="e.g. Port Harcourt, Obio/Akpor, Ikwerre"
                className="text-xs h-10 border-[#D9DEEC]"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="school-address"
              className="text-xs font-bold text-[#151B2E] uppercase tracking-wider block"
            >
              Full Physical Street Address
            </label>
            <Input
              id="school-address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. 25/27 Liberation Stadium Road, Elekahia / New GRA"
              className="text-xs h-10 border-[#D9DEEC]"
            />
          </div>
        </Card>
      )}

      {/* 4. Contact & Socials Tab */}
      {activeTab === "contact" && (
        <Card className="p-5 bg-white border-[#D9DEEC] rounded-lg shadow-xs space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label
                htmlFor="school-phone"
                className="text-xs font-bold text-[#151B2E] uppercase tracking-wider block"
              >
                Admissions Phone Number
              </label>
              <Input
                id="school-phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+234 803 000 0000"
                className="text-xs h-10 border-[#D9DEEC]"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="school-whatsapp"
                className="text-xs font-bold text-[#151B2E] uppercase tracking-wider block"
              >
                WhatsApp Hotline
              </label>
              <Input
                id="school-whatsapp"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="+234 803 000 0000"
                className="text-xs h-10 border-[#D9DEEC]"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="school-email"
                className="text-xs font-bold text-[#151B2E] uppercase tracking-wider block"
              >
                Admissions Email
              </label>
              <Input
                id="school-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admissions@school.edu.ng"
                className="text-xs h-10 border-[#D9DEEC]"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="school-website"
                className="text-xs font-bold text-[#151B2E] uppercase tracking-wider block"
              >
                Official Website
              </label>
              <Input
                id="school-website"
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://school.edu.ng"
                className="text-xs h-10 border-[#D9DEEC]"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-[#D9DEEC]/60 space-y-3">
            <h3 className="text-xs font-bold text-[#151B2E] uppercase tracking-wider">
              Social Media Channels
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Input
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                placeholder="Instagram handle / URL"
                className="text-xs h-9 border-[#D9DEEC]"
              />
              <Input
                value={facebook}
                onChange={(e) => setFacebook(e.target.value)}
                placeholder="Facebook page / URL"
                className="text-xs h-9 border-[#D9DEEC]"
              />
              <Input
                value={xSocial}
                onChange={(e) => setXSocial(e.target.value)}
                placeholder="X / Twitter handle / URL"
                className="text-xs h-9 border-[#D9DEEC]"
              />
            </div>
          </div>
        </Card>
      )}

      {/* 5. Fees in Naira Tab */}
      {activeTab === "fees" && (
        <Card className="p-5 bg-white border-[#D9DEEC] rounded-lg shadow-xs space-y-5">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-[#151B2E]">
              Tuition &amp; Fees Schedule (NGN ₦)
            </h3>
            <p className="text-xs text-muted-foreground">
              Configure tuition ranges with live Naira formatting. Choose how
              fees appear to parents in the directory.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Fee Min */}
            <div className="space-y-1.5">
              <label
                htmlFor="school-feemin"
                className="text-xs font-bold text-[#151B2E] uppercase tracking-wider flex items-center justify-between"
              >
                <span>Minimum Tuition Fee (₦)</span>
                {typeof feeMin === "number" && (
                  <Badge
                    variant="outline"
                    className="font-mono text-emerald-700 bg-emerald-50 border-emerald-200"
                  >
                    ₦{feeMin.toLocaleString()}
                  </Badge>
                )}
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-[#184098]">
                  ₦
                </span>
                <Input
                  id="school-feemin"
                  type="number"
                  min="0"
                  step="5000"
                  value={feeMin}
                  onChange={(e) =>
                    setFeeMin(
                      e.target.value === "" ? "" : Number(e.target.value),
                    )
                  }
                  placeholder="e.g. 350000"
                  className="pl-8 h-10 text-xs font-mono border-[#D9DEEC]"
                />
              </div>
            </div>

            {/* Fee Max */}
            <div className="space-y-1.5">
              <label
                htmlFor="school-feemax"
                className="text-xs font-bold text-[#151B2E] uppercase tracking-wider flex items-center justify-between"
              >
                <span>Maximum Tuition Fee (₦)</span>
                {typeof feeMax === "number" && (
                  <Badge
                    variant="outline"
                    className="font-mono text-emerald-700 bg-emerald-50 border-emerald-200"
                  >
                    ₦{feeMax.toLocaleString()}
                  </Badge>
                )}
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-[#184098]">
                  ₦
                </span>
                <Input
                  id="school-feemax"
                  type="number"
                  min="0"
                  step="5000"
                  value={feeMax}
                  onChange={(e) =>
                    setFeeMax(
                      e.target.value === "" ? "" : Number(e.target.value),
                    )
                  }
                  placeholder="e.g. 600000"
                  className="pl-8 h-10 text-xs font-mono border-[#D9DEEC]"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#D9DEEC]/60">
            {/* Fee Period */}
            <div className="space-y-1.5">
              <label
                htmlFor="school-feeperiod"
                className="text-xs font-bold text-[#151B2E] uppercase tracking-wider block"
              >
                Billing Period
              </label>
              <select
                id="school-feeperiod"
                value={feePeriod}
                onChange={(e) =>
                  setFeePeriod(e.target.value as typeof feePeriod)
                }
                className="w-full h-10 text-xs border border-[#D9DEEC] rounded-md px-3 bg-white text-[#151B2E] focus:ring-1 focus:ring-[#184098]"
              >
                <option value="per_term">Per Term (3 terms per year)</option>
                <option value="per_session">Per Session (Annual)</option>
              </select>
            </div>

            {/* Fee Visibility */}
            <div className="space-y-1.5">
              <label
                htmlFor="school-feevisibility"
                className="text-xs font-bold text-[#151B2E] uppercase tracking-wider block"
              >
                Public Directory Visibility
              </label>
              <select
                id="school-feevisibility"
                value={feeVisibility}
                onChange={(e) =>
                  setFeeVisibility(e.target.value as typeof feeVisibility)
                }
                className="w-full h-10 text-xs border border-[#D9DEEC] rounded-md px-3 bg-white text-[#151B2E] focus:ring-1 focus:ring-[#184098]"
              >
                <option value="band_only">
                  Fee Band (e.g. ₦350,000 - ₦600,000 / term)
                </option>
                <option value="exact">Exact Amount</option>
                <option value="on_request">Contact School / On Request</option>
                <option value="hidden">Hidden completely</option>
              </select>
            </div>
          </div>
        </Card>
      )}

      {/* 6. Media & Gallery Tab */}
      {activeTab === "media" && (
        <Card className="p-5 bg-white border-[#D9DEEC] rounded-lg shadow-xs space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SectionImageUpload
              label="School Crest / Logo"
              description="Upload school crest or pick from the media library."
              value={logo}
              folder="schools/logos"
              aspectRatio="square"
              onChange={({ url }) => setLogo(url)}
            />

            <SectionImageUpload
              label="Campus Cover Photo"
              description="Primary banner photo displayed at the top of the school page."
              value={coverImage}
              folder="schools/covers"
              aspectRatio="video"
              onChange={({ url }) => setCoverImage(url)}
            />
          </div>

          {/* Gallery Items */}
          <div className="pt-4 border-t border-[#D9DEEC]/60 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-xs font-bold text-[#151B2E] uppercase tracking-wider">
                  Campus Gallery Photos ({gallery.length})
                </h3>
                <p className="text-[11px] text-muted-foreground">
                  Showcase campus facilities, classrooms, sports grounds, and
                  science laboratories.
                </p>
              </div>

              <Button
                type="button"
                onClick={() => setIsGalleryDrawerOpen(true)}
                variant="outline"
                className="h-9 text-xs border-[#D9DEEC] text-[#184098] bg-[#EEF2FA]/50 hover:bg-[#EEF2FA] shrink-0 font-bold"
              >
                <FolderOpen className="size-3.5 mr-1.5 text-[#184098]" />
                Choose from Gallery
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Input
                value={newGalleryUrl}
                onChange={(e) => setNewGalleryUrl(e.target.value)}
                placeholder="Or paste external image URL to add..."
                className="text-xs h-10 border-[#D9DEEC]"
              />
              <Button
                type="button"
                onClick={handleAddGalleryImage}
                variant="outline"
                className="h-10 text-xs border-[#D9DEEC] text-[#184098] shrink-0 font-bold"
              >
                <Plus className="size-3.5 mr-1" /> Add URL
              </Button>
            </div>

            {gallery.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                {gallery.map((url, idx) => (
                  <div
                    key={url}
                    className="relative group rounded-lg overflow-hidden border border-[#D9DEEC] aspect-video bg-[#FAFBFF]"
                  >
                    <Image
                      src={normalizeImageUrl(url)}
                      alt={`Gallery ${idx + 1}`}
                      fill
                      unoptimized
                      className="object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveGalleryImage(idx)}
                      className="absolute top-1.5 right-1.5 size-6 bg-red-600 text-white rounded flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                      title="Remove image"
                    >
                      <Trash2 className="size-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <MediaLibraryDrawer
              open={isGalleryDrawerOpen}
              onOpenChange={setIsGalleryDrawerOpen}
              onSelect={({ url }) => {
                setGallery((prev) => [...prev, url]);
                toast.success("Photo added to campus gallery");
              }}
            />
          </div>
        </Card>
      )}

      {/* 7. Publishing Tab */}
      {activeTab === "publishing" && (
        <Card className="p-5 bg-white border-[#D9DEEC] rounded-lg shadow-xs space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label
                htmlFor="school-status"
                className="text-xs font-bold text-[#151B2E] uppercase tracking-wider block"
              >
                Publishing Status
              </label>
              <select
                id="school-status"
                value={status}
                onChange={(e) => setStatus(e.target.value as typeof status)}
                className="w-full h-10 text-xs border border-[#D9DEEC] rounded-md px-3 bg-white text-[#151B2E] focus:ring-1 focus:ring-[#184098] font-bold"
              >
                <option value="draft">Draft (Admin Only)</option>
                <option value="published">Published (Live in Directory)</option>
                <option value="archived">Archived (Hidden)</option>
              </select>
            </div>

            <div className="p-3 rounded-lg border border-[#D9DEEC] flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-[#151B2E] block">
                  Verified Badge
                </span>
                <span className="text-[11px] text-muted-foreground">
                  Authentic verified school
                </span>
              </div>
              <input
                type="checkbox"
                checked={verified}
                onChange={(e) => setVerified(e.target.checked)}
                className="size-4 accent-[#184098]"
              />
            </div>

            <div className="p-3 rounded-lg border border-[#D9DEEC] flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-[#151B2E] block">
                  Featured Spotlight
                </span>
                <span className="text-[11px] text-muted-foreground">
                  Promoted in directory header
                </span>
              </div>
              <input
                type="checkbox"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                className="size-4 accent-[#184098]"
              />
            </div>
          </div>
        </Card>
      )}

      {/* Footer Submit Buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-[#D9DEEC]">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/admin/schools")}
          className="text-xs border-[#D9DEEC]"
        >
          Cancel
        </Button>

        <div className="flex items-center gap-2">
          <Button
            type="submit"
            disabled={isPending}
            className="bg-[#184098] hover:bg-[#08276B] text-white font-bold text-xs px-5 h-10 shadow-xs"
          >
            {isPending ? (
              <>
                <Loader2 className="size-3.5 mr-1.5 animate-spin" />
                Saving School Profile...
              </>
            ) : isEditing ? (
              "Save Changes"
            ) : (
              "Create School Profile"
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}
