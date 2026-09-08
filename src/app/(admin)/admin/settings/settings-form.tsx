"use client";

import {
  AlertCircle,
  Check,
  Globe,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Plus,
  Save,
  Share2,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { updateSiteSettingsAction } from "@/app/(admin)/admin/settings/actions";
import { SectionImageUpload } from "@/components/admin/media/section-image-upload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type {
  ContactAddressItem,
  ContactEmailItem,
  ContactPhoneItem,
  SiteSetting,
  SocialLinkItem,
} from "@/lib/db/schema";

interface SettingsFormProps {
  initialSettings: SiteSetting;
}

export function SettingsForm({ initialSettings }: SettingsFormProps) {
  const [activeTab, setActiveTab] = useState<"general" | "contact" | "social">(
    "contact",
  );

  // General
  const [siteName, setSiteName] = useState(initialSettings.siteName);
  const [siteTagline, setSiteTagline] = useState(
    initialSettings.siteTagline || "",
  );
  const [siteDescription, setSiteDescription] = useState(
    initialSettings.siteDescription || "",
  );
  const [defaultOgImage, setDefaultOgImage] = useState(
    initialSettings.defaultOgImage || "",
  );
  const [googleAnalyticsId, setGoogleAnalyticsId] = useState(
    initialSettings.googleAnalyticsId || "",
  );

  // Multi-Contact
  const [emails, setEmails] = useState<ContactEmailItem[]>(
    initialSettings.contactEmails || [],
  );
  const [phones, setPhones] = useState<ContactPhoneItem[]>(
    initialSettings.contactPhones || [],
  );
  const [addresses, setAddresses] = useState<ContactAddressItem[]>(
    initialSettings.contactAddresses || [],
  );

  // Social Links
  const [socials, setSocials] = useState<SocialLinkItem[]>(
    initialSettings.socialLinks || [],
  );

  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saved" | "error">(
    "idle",
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Helpers for Multi-Contact
  function addEmail() {
    setEmails((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        label: "General Inquiries",
        email: "",
        isPrimary: prev.length === 0,
      },
    ]);
  }

  function removeEmail(id: string) {
    setEmails((prev) => prev.filter((e) => e.id !== id));
  }

  function updateEmail(
    id: string,
    field: keyof ContactEmailItem,
    val: string | boolean,
  ) {
    setEmails((prev) =>
      prev.map((e) => {
        if (e.id === id) {
          return { ...e, [field]: val };
        }
        if (field === "isPrimary" && val === true) {
          return { ...e, isPrimary: false };
        }
        return e;
      }),
    );
  }

  function addPhone() {
    setPhones((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        label: "Office Line",
        number: "",
        isWhatsapp: false,
        isPrimary: prev.length === 0,
      },
    ]);
  }

  function removePhone(id: string) {
    setPhones((prev) => prev.filter((p) => p.id !== id));
  }

  function updatePhone(
    id: string,
    field: keyof ContactPhoneItem,
    val: string | boolean,
  ) {
    setPhones((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          return { ...p, [field]: val };
        }
        if (field === "isPrimary" && val === true) {
          return { ...p, isPrimary: false };
        }
        return p;
      }),
    );
  }

  function addAddress() {
    setAddresses((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        label: "Port Harcourt Office",
        address: "",
        city: "Port Harcourt",
        state: "Rivers State",
        isPrimary: prev.length === 0,
      },
    ]);
  }

  function removeAddress(id: string) {
    setAddresses((prev) => prev.filter((a) => a.id !== id));
  }

  function updateAddress(
    id: string,
    field: keyof ContactAddressItem,
    val: string | boolean,
  ) {
    setAddresses((prev) =>
      prev.map((a) => {
        if (a.id === id) {
          return { ...a, [field]: val };
        }
        if (field === "isPrimary" && val === true) {
          return { ...a, isPrimary: false };
        }
        return a;
      }),
    );
  }

  function addSocial() {
    setSocials((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        platform: "Instagram",
        url: "",
        handle: "",
      },
    ]);
  }

  function removeSocial(id: string) {
    setSocials((prev) => prev.filter((s) => s.id !== id));
  }

  function updateSocial(id: string, field: keyof SocialLinkItem, val: string) {
    setSocials((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [field]: val } : s)),
    );
  }

  async function handleSave() {
    setIsSaving(true);
    setErrorMessage(null);
    try {
      const res = await updateSiteSettingsAction({
        siteName,
        siteTagline,
        siteDescription,
        contactEmails: emails,
        contactPhones: phones,
        contactAddresses: addresses,
        socialLinks: socials,
        defaultOgImage,
        googleAnalyticsId,
      });

      if (res.success) {
        setSaveStatus("saved");
        toast.success("Site settings updated successfully");
        setTimeout(() => setSaveStatus("idle"), 3000);
      } else {
        setSaveStatus("error");
        setErrorMessage(res.error || "Failed to update settings.");
        toast.error("Failed to update settings", {
          description: res.error,
        });
      }
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h1 className="text-2xl font-bold font-heading text-foreground">
            Site Settings &amp; Contacts
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Configure global organization identity, multiple contact channels,
            and social links.
          </p>
        </div>

        <Button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="gap-2 min-w-[130px] h-9"
        >
          {isSaving ? (
            <>
              <Loader2 className="size-3.5 animate-spin" />
              Saving...
            </>
          ) : saveStatus === "saved" ? (
            <>
              <Check className="size-3.5 text-emerald-300" />
              Settings Saved!
            </>
          ) : (
            <>
              <Save className="size-3.5" />
              Save Settings
            </>
          )}
        </Button>
      </div>

      {errorMessage && (
        <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive rounded-md text-xs flex items-center gap-2">
          <AlertCircle className="size-4 shrink-0" />
          {errorMessage}
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-border">
        <button
          type="button"
          onClick={() => setActiveTab("contact")}
          className={`pb-2.5 text-sm font-medium border-b-2 transition-colors px-3 flex items-center gap-1.5 ${
            activeTab === "contact"
              ? "border-primary text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Phone className="size-4" />
          Direct Contacts &amp; Locations
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("general")}
          className={`pb-2.5 text-sm font-medium border-b-2 transition-colors px-3 flex items-center gap-1.5 ${
            activeTab === "general"
              ? "border-primary text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Globe className="size-4" />
          General &amp; SEO
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("social")}
          className={`pb-2.5 text-sm font-medium border-b-2 transition-colors px-3 flex items-center gap-1.5 ${
            activeTab === "social"
              ? "border-primary text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Share2 className="size-4" />
          Social Profiles
        </button>
      </div>

      {/* TAB 1: Direct Contacts & Locations (Multi-Entry) */}
      {activeTab === "contact" && (
        <div className="space-y-6">
          {/* PHONE NUMBERS */}
          <div className="rounded-xl border border-border bg-card p-5 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div>
                <h3 className="font-heading font-bold text-base text-foreground flex items-center gap-2">
                  <Phone className="size-4 text-primary" />
                  Phone &amp; WhatsApp Lines
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Manage multiple telephone hotlines with WhatsApp integration
                  toggles.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addPhone}
                className="h-8 gap-1 text-xs"
              >
                <Plus className="size-3.5" />
                Add Phone Line
              </Button>
            </div>

            {phones.length === 0 ? (
              <p className="text-xs text-muted-foreground italic py-3 text-center">
                No phone lines added yet. Click &quot;Add Phone Line&quot; to
                provide parent and school contact numbers.
              </p>
            ) : (
              <div className="space-y-3">
                {phones.map((phone) => (
                  <div
                    key={phone.id}
                    className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 rounded-lg border border-border/70 bg-muted/20"
                  >
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <Label className="text-[11px] text-muted-foreground">
                          Line Label
                        </Label>
                        <Input
                          placeholder="e.g. Admissions Desk, WhatsApp Support"
                          value={phone.label}
                          onChange={(e) =>
                            updatePhone(phone.id, "label", e.target.value)
                          }
                          className="h-8 text-xs mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-[11px] text-muted-foreground">
                          Phone Number
                        </Label>
                        <Input
                          placeholder="+234 803 000 0000"
                          value={phone.number}
                          onChange={(e) =>
                            updatePhone(phone.id, "number", e.target.value)
                          }
                          className="h-8 text-xs mt-1"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0 pt-2 sm:pt-4">
                      <label className="flex items-center gap-1.5 text-xs text-foreground cursor-pointer">
                        <input
                          type="checkbox"
                          checked={phone.isWhatsapp}
                          onChange={(e) =>
                            updatePhone(
                              phone.id,
                              "isWhatsapp",
                              e.target.checked,
                            )
                          }
                          className="rounded border-border text-emerald-600 focus:ring-emerald-500 size-3.5"
                        />
                        <span>WhatsApp</span>
                      </label>

                      <label className="flex items-center gap-1.5 text-xs text-foreground cursor-pointer">
                        <input
                          type="checkbox"
                          checked={phone.isPrimary}
                          onChange={(e) =>
                            updatePhone(phone.id, "isPrimary", e.target.checked)
                          }
                          className="rounded border-border text-primary focus:ring-primary size-3.5"
                        />
                        <span>Primary</span>
                      </label>

                      <button
                        type="button"
                        onClick={() => removePhone(phone.id)}
                        className="p-1 text-destructive/70 hover:text-destructive transition-colors rounded"
                        title="Delete phone"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* EMAIL ADDRESSES */}
          <div className="rounded-xl border border-border bg-card p-5 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div>
                <h3 className="font-heading font-bold text-base text-foreground flex items-center gap-2">
                  <Mail className="size-4 text-primary" />
                  Email Addresses
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Provide multiple specialized inboxes (e.g. General,
                  Admissions, Sponsorships).
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addEmail}
                className="h-8 gap-1 text-xs"
              >
                <Plus className="size-3.5" />
                Add Email
              </Button>
            </div>

            {emails.length === 0 ? (
              <p className="text-xs text-muted-foreground italic py-3 text-center">
                No email addresses added yet.
              </p>
            ) : (
              <div className="space-y-3">
                {emails.map((email) => (
                  <div
                    key={email.id}
                    className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 rounded-lg border border-border/70 bg-muted/20"
                  >
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <Label className="text-[11px] text-muted-foreground">
                          Department / Label
                        </Label>
                        <Input
                          placeholder="e.g. General Inquiries, Admissions"
                          value={email.label}
                          onChange={(e) =>
                            updateEmail(email.id, "label", e.target.value)
                          }
                          className="h-8 text-xs mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-[11px] text-muted-foreground">
                          Email Address
                        </Label>
                        <Input
                          type="email"
                          placeholder="info@portharcourtschools.ng"
                          value={email.email}
                          onChange={(e) =>
                            updateEmail(email.id, "email", e.target.value)
                          }
                          className="h-8 text-xs mt-1"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0 pt-2 sm:pt-4">
                      <label className="flex items-center gap-1.5 text-xs text-foreground cursor-pointer">
                        <input
                          type="checkbox"
                          checked={email.isPrimary}
                          onChange={(e) =>
                            updateEmail(email.id, "isPrimary", e.target.checked)
                          }
                          className="rounded border-border text-primary focus:ring-primary size-3.5"
                        />
                        <span>Primary</span>
                      </label>

                      <button
                        type="button"
                        onClick={() => removeEmail(email.id)}
                        className="p-1 text-destructive/70 hover:text-destructive transition-colors rounded"
                        title="Delete email"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* PHYSICAL LOCATIONS */}
          <div className="rounded-xl border border-border bg-card p-5 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div>
                <h3 className="font-heading font-bold text-base text-foreground flex items-center gap-2">
                  <MapPin className="size-4 text-primary" />
                  Office &amp; Campus Addresses
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Physical office, event secretariat, or campus locations.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addAddress}
                className="h-8 gap-1 text-xs"
              >
                <Plus className="size-3.5" />
                Add Address
              </Button>
            </div>

            {addresses.length === 0 ? (
              <p className="text-xs text-muted-foreground italic py-3 text-center">
                No office addresses configured yet.
              </p>
            ) : (
              <div className="space-y-3">
                {addresses.map((addr) => (
                  <div
                    key={addr.id}
                    className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 rounded-lg border border-border/70 bg-muted/20"
                  >
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <Label className="text-[11px] text-muted-foreground">
                          Location Name
                        </Label>
                        <Input
                          placeholder="e.g. Headquarters, Summit Secretariat"
                          value={addr.label}
                          onChange={(e) =>
                            updateAddress(addr.id, "label", e.target.value)
                          }
                          className="h-8 text-xs mt-1"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <Label className="text-[11px] text-muted-foreground">
                          Street Address, City &amp; State
                        </Label>
                        <Input
                          placeholder="e.g. 14 Trans-Amadi Commercial Layout, Port Harcourt"
                          value={addr.address}
                          onChange={(e) =>
                            updateAddress(addr.id, "address", e.target.value)
                          }
                          className="h-8 text-xs mt-1"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0 pt-2 sm:pt-4">
                      <label className="flex items-center gap-1.5 text-xs text-foreground cursor-pointer">
                        <input
                          type="checkbox"
                          checked={addr.isPrimary}
                          onChange={(e) =>
                            updateAddress(
                              addr.id,
                              "isPrimary",
                              e.target.checked,
                            )
                          }
                          className="rounded border-border text-primary focus:ring-primary size-3.5"
                        />
                        <span>Primary</span>
                      </label>

                      <button
                        type="button"
                        onClick={() => removeAddress(addr.id)}
                        className="p-1 text-destructive/70 hover:text-destructive transition-colors rounded"
                        title="Delete address"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: General & SEO */}
      {activeTab === "general" && (
        <div className="rounded-xl border border-border bg-card p-5 space-y-4 shadow-xs">
          <h3 className="font-heading font-bold text-base text-foreground border-b border-border/60 pb-2">
            Site Identity &amp; Global SEO Defaults
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-xs">Platform Name</Label>
              <Input
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
                className="mt-1 text-xs"
              />
            </div>
            <div>
              <Label className="text-xs">Google Analytics Measurement ID</Label>
              <Input
                placeholder="G-XXXXXXXXXX"
                value={googleAnalyticsId}
                onChange={(e) => setGoogleAnalyticsId(e.target.value)}
                className="mt-1 text-xs font-mono"
              />
            </div>
          </div>

          <div>
            <Label className="text-xs">Site Tagline</Label>
            <Input
              value={siteTagline}
              onChange={(e) => setSiteTagline(e.target.value)}
              className="mt-1 text-xs"
            />
          </div>

          <div>
            <Label className="text-xs">Global Meta Description</Label>
            <Textarea
              rows={3}
              value={siteDescription}
              onChange={(e) => setSiteDescription(e.target.value)}
              className="mt-1 text-xs"
            />
          </div>

          <SectionImageUpload
            label="Default Social Share OpenGraph Image"
            description="Fallback share image used across WhatsApp, Facebook, LinkedIn, and X when a specific page image is not provided."
            value={defaultOgImage}
            folder="branding"
            aspectRatio="banner"
            onChange={({ url }) => setDefaultOgImage(url)}
          />
        </div>
      )}

      {/* TAB 3: Social Profiles */}
      {activeTab === "social" && (
        <div className="rounded-xl border border-border bg-card p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <div>
              <h3 className="font-heading font-bold text-base text-foreground flex items-center gap-2">
                <Share2 className="size-4 text-primary" />
                Social Media Channels
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Feeds social link icons in header, footer, and outreach blocks.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addSocial}
              className="h-8 gap-1 text-xs"
            >
              <Plus className="size-3.5" />
              Add Social Profile
            </Button>
          </div>

          {socials.length === 0 ? (
            <p className="text-xs text-muted-foreground italic py-3 text-center">
              No social profiles added yet.
            </p>
          ) : (
            <div className="space-y-3">
              {socials.map((soc) => (
                <div
                  key={soc.id}
                  className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 rounded-lg border border-border/70 bg-muted/20"
                >
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <Label className="text-[11px] text-muted-foreground">
                        Platform
                      </Label>
                      <Input
                        placeholder="e.g. Instagram, Facebook, X, LinkedIn"
                        value={soc.platform}
                        onChange={(e) =>
                          updateSocial(soc.id, "platform", e.target.value)
                        }
                        className="h-8 text-xs mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-[11px] text-muted-foreground">
                        Profile / Page URL
                      </Label>
                      <Input
                        placeholder="https://..."
                        value={soc.url}
                        onChange={(e) =>
                          updateSocial(soc.id, "url", e.target.value)
                        }
                        className="h-8 text-xs mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-[11px] text-muted-foreground">
                        Display Handle
                      </Label>
                      <Input
                        placeholder="@portharcourtschools"
                        value={soc.handle || ""}
                        onChange={(e) =>
                          updateSocial(soc.id, "handle", e.target.value)
                        }
                        className="h-8 text-xs mt-1"
                      />
                    </div>
                  </div>

                  <div className="flex items-center shrink-0 pt-2 sm:pt-4">
                    <button
                      type="button"
                      onClick={() => removeSocial(soc.id)}
                      className="p-1 text-destructive/70 hover:text-destructive transition-colors rounded"
                      title="Delete profile"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
