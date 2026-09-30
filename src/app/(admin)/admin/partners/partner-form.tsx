"use client";

import { ArrowLeft, Globe, Loader2, Save } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { SectionImageUpload } from "@/components/admin/media/section-image-upload";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createPartnerAction, updatePartnerAction } from "./actions";

interface PartnerFormProps {
  initialData?: {
    id: string;
    name: string;
    logo: string;
    tier: string;
    website?: string | null;
    description?: string | null;
    isActive: boolean;
    order: number;
  };
}

export function PartnerForm({ initialData }: PartnerFormProps) {
  const router = useRouter();
  const isEditing = !!initialData;

  const [name, setName] = useState(initialData?.name || "");
  const [logo, setLogo] = useState(initialData?.logo || "");
  const [tier, setTier] = useState(initialData?.tier || "partner");
  const [website, setWebsite] = useState(initialData?.website || "");
  const [description, setDescription] = useState(
    initialData?.description || "",
  );
  const [isActive, setIsActive] = useState(initialData?.isActive ?? true);
  const [order, setOrder] = useState(String(initialData?.order ?? 0));

  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Please enter a partner name.");
      return;
    }

    if (!logo.trim()) {
      setError("Please specify a logo URL or image path.");
      return;
    }

    const formData = new FormData();
    formData.set("name", name.trim());
    formData.set("logo", logo.trim());
    formData.set("tier", tier);
    formData.set("website", website.trim());
    formData.set("description", description.trim());
    formData.set("isActive", isActive ? "true" : "false");
    formData.set("order", order || "0");

    startTransition(async () => {
      const action = isEditing
        ? updatePartnerAction(initialData.id, {}, formData)
        : createPartnerAction({}, formData);

      const res = await action;

      if (res?.error) {
        setError(res.error);
        toast.error("Failed to save partner", { description: res.error });
      } else {
        toast.success(
          isEditing
            ? "Partner updated successfully"
            : "Partner created successfully",
        );
        router.push("/admin/partners");
        router.refresh();
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#D9DEEC] pb-4">
        <div className="flex items-center gap-3">
          <Link href="/admin/partners">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="size-9 p-0 border-[#D9DEEC] text-[#184098]"
            >
              <ArrowLeft className="size-4" />
            </Button>
          </Link>
          <div>
            <h1 className="font-heading text-xl sm:text-2xl font-black tracking-tight text-[#151B2E]">
              {isEditing ? `Edit ${initialData.name}` : "Add New Partner"}
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Manage educational partners, corporate sponsors, and institutional
              collaborators.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/admin/partners">
            <Button
              type="button"
              variant="outline"
              className="h-10 text-xs border-[#D9DEEC]"
            >
              Cancel
            </Button>
          </Link>
          <Button
            type="submit"
            disabled={isPending || !name || !logo}
            className="h-10 text-xs bg-[#184098] hover:bg-[#08276B] text-white font-bold px-4"
          >
            {isPending ? (
              <>
                <Loader2 className="size-4 animate-spin mr-1.5" />
                Saving...
              </>
            ) : (
              <>
                <Save className="size-4 mr-1.5" />
                {isEditing ? "Save Changes" : "Create Partner"}
              </>
            )}
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-md bg-red-50 border border-red-200 text-xs text-red-600 font-medium">
          {error}
        </div>
      )}

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form Fields */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="border-[#D9DEEC] bg-white p-5 rounded-lg space-y-4 shadow-xs">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-[#151B2E] border-b border-[#D9DEEC] pb-2">
              Partner Identity
            </CardTitle>

            {/* Name */}
            <div className="space-y-1.5">
              <label
                htmlFor="partner-name"
                className="block text-xs font-bold text-[#151B2E]"
              >
                Partner Organization Name{" "}
                <span className="text-red-500">*</span>
              </label>
              <Input
                id="partner-name"
                placeholder="e.g. GeePhill Education Consulting, EdFocus Africa"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="h-10 text-xs border-[#D9DEEC]"
              />
            </div>

            {/* Website */}
            <div className="space-y-1.5">
              <label
                htmlFor="partner-website"
                className="block text-xs font-bold text-[#151B2E]"
              >
                Official Website URL
              </label>
              <div className="relative">
                <Input
                  id="partner-website"
                  type="url"
                  placeholder="https://example.com"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className="h-10 text-xs border-[#D9DEEC] pl-8"
                />
                <Globe className="size-4 text-muted-foreground absolute left-2.5 top-3" />
              </div>
              <p className="text-[11px] text-muted-foreground">
                Optional: When clicked on the public website, users will be
                taken here.
              </p>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label
                htmlFor="partner-desc"
                className="block text-xs font-bold text-[#151B2E]"
              >
                Collaboration Summary / Description
              </label>
              <Textarea
                id="partner-desc"
                placeholder="Briefly describe the partnership focus (e.g. STEM teacher development, curriculum advisory, school safety sponsor)..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="text-xs border-[#D9DEEC]"
              />
            </div>
          </Card>

          {/* Logo Details */}
          <Card className="border-[#D9DEEC] bg-white p-5 rounded-lg space-y-4 shadow-xs">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-[#151B2E] border-b border-[#D9DEEC] pb-2">
              Partner Logo
            </CardTitle>

            <SectionImageUpload
              label="Partner Logo"
              description="Transparent PNG or SVG recommended. Upload from device or choose from the media gallery."
              value={logo}
              folder="partners"
              aspectRatio="square"
              required
              onChange={({ url }) => setLogo(url)}
            />
          </Card>
        </div>

        {/* Right Column: Classification & Publishing Controls */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="border-[#D9DEEC] bg-white p-5 rounded-lg space-y-4 shadow-xs">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-[#151B2E] border-b border-[#D9DEEC] pb-2">
              Tier &amp; Visibility
            </CardTitle>

            {/* Tier */}
            <div className="space-y-1.5">
              <label
                htmlFor="partner-tier"
                className="block text-xs font-bold text-[#151B2E]"
              >
                Partnership Tier
              </label>
              <Select
                id="partner-tier"
                value={tier}
                onChange={(e) => setTier(e.target.value)}
                className="h-10 text-xs border-[#D9DEEC]"
              >
                <option value="headline">Headline Partner</option>
                <option value="strategic">Strategic Partner</option>
                <option value="corporate">Corporate Sponsor</option>
                <option value="technology">Technology Partner</option>
                <option value="education">Education Partner</option>
                <option value="partner">General Partner</option>
              </Select>
            </div>

            {/* Display Order */}
            <div className="space-y-1.5">
              <label
                htmlFor="partner-order"
                className="block text-xs font-bold text-[#151B2E]"
              >
                Display Priority / Sort Order
              </label>
              <Input
                id="partner-order"
                type="number"
                value={order}
                onChange={(e) => setOrder(e.target.value)}
                className="h-10 text-xs border-[#D9DEEC]"
              />
              <p className="text-[11px] text-muted-foreground">
                Lower numbers appear first (e.g. 0, 1, 2...).
              </p>
            </div>

            {/* Active Toggle */}
            <label className="flex items-center justify-between gap-3 pt-3 border-t border-[#D9DEEC] cursor-pointer">
              <div>
                <span className="block text-xs font-bold text-[#151B2E]">
                  Active &amp; Published
                </span>
                <span className="text-[11px] text-muted-foreground block">
                  Show on public website &amp; homepage marquee
                </span>
              </div>
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="size-4 rounded border-gray-300 text-[#184098] focus:ring-[#184098] cursor-pointer"
              />
            </label>
          </Card>
        </div>
      </div>
    </form>
  );
}
