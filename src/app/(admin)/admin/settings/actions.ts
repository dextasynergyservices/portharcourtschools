"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { getOrSetCache, invalidateCache } from "@/lib/cache";
import {
  type ContactAddressItem,
  type ContactEmailItem,
  type ContactPhoneItem,
  db,
  type SiteSetting,
  type SocialLinkItem,
  siteSettings,
} from "@/lib/db";

const DEFAULT_SETTINGS_ID = "default";

/**
 * Fetch global site settings with multi-contact arrays.
 * Cached via two-tier cache (L1 Memory + L2 Redis) with Next.js revalidation tag.
 */
export async function getSiteSettings(): Promise<SiteSetting> {
  return getOrSetCache<SiteSetting>(
    "site-settings:global",
    ["site-settings"],
    async () => {
      try {
        const [existing] = await db
          .select()
          .from(siteSettings)
          .where(eq(siteSettings.id, DEFAULT_SETTINGS_ID))
          .limit(1);

        if (existing) {
          return existing;
        }

        // Initialize default row if not found
        const defaultData = {
          id: DEFAULT_SETTINGS_ID,
          siteName: "Port Harcourt Schools",
          siteTagline:
            "The definitive educational resource for families and schools in Port Harcourt.",
          siteDescription:
            "Discover top-rated primary and secondary schools across Port Harcourt. Explore verified reviews, curriculum options, facilities, tuition estimates, and admission guidelines.",
          contactEmails: [
            {
              id: "email-1",
              label: "General Inquiries",
              email: "edfocusafrica@gmail.com",
              isPrimary: true,
            },
          ],
          contactPhones: [
            {
              id: "phone-1",
              label: "Admissions Desk & Support",
              number: "+234 803 123 4567",
              isWhatsapp: true,
              isPrimary: true,
            },
          ],
          contactAddresses: [
            {
              id: "addr-1",
              label: "Head Office",
              address: "14 Trans-Amadi Commercial Layout",
              city: "Port Harcourt",
              state: "Rivers State",
              isPrimary: true,
            },
          ],
          socialLinks: [
            {
              id: "soc-1",
              platform: "Instagram",
              url: "https://instagram.com/portharcourtschools",
              handle: "@portharcourtschools",
            },
            {
              id: "soc-2",
              platform: "Facebook",
              url: "https://facebook.com/portharcourtschools",
              handle: "portharcourtschools",
            },
          ],
          defaultOgImage: null,
          googleAnalyticsId: null,
        };

        const [inserted] = await db
          .insert(siteSettings)
          .values(defaultData)
          .returning();

        return inserted;
      } catch (err) {
        console.error("Error retrieving site settings:", err);
        // Fallback in-memory object so public site never breaks
        return {
          id: DEFAULT_SETTINGS_ID,
          siteName: "Port Harcourt Schools",
          siteTagline:
            "The definitive educational resource for families and schools in Port Harcourt.",
          siteDescription:
            "Discover top-rated primary and secondary schools across Port Harcourt.",
          contactEmails: [
            {
              id: "email-1",
              label: "General Inquiries",
              email: "edfocusafrica@gmail.com",
              isPrimary: true,
            },
          ],
          contactPhones: [
            {
              id: "phone-1",
              label: "Admissions Desk",
              number: "+234 803 123 4567",
              isWhatsapp: true,
              isPrimary: true,
            },
          ],
          contactAddresses: [
            {
              id: "addr-1",
              label: "Head Office",
              address: "14 Trans-Amadi Commercial Layout",
              city: "Port Harcourt",
              state: "Rivers State",
              isPrimary: true,
            },
          ],
          socialLinks: [],
          defaultOgImage: null,
          googleAnalyticsId: null,
          updatedAt: new Date(),
        };
      }
    },
    86400,
  );
}

/**
 * Update site settings action from admin settings page.
 */
export async function updateSiteSettingsAction(params: {
  siteName: string;
  siteTagline?: string;
  siteDescription?: string;
  contactEmails: ContactEmailItem[];
  contactPhones: ContactPhoneItem[];
  contactAddresses: ContactAddressItem[];
  socialLinks: SocialLinkItem[];
  defaultOgImage?: string;
  googleAnalyticsId?: string;
}) {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Unauthorized. Please log in." };
  }

  try {
    const [existing] = await db
      .select()
      .from(siteSettings)
      .where(eq(siteSettings.id, DEFAULT_SETTINGS_ID))
      .limit(1);

    if (existing) {
      await db
        .update(siteSettings)
        .set({
          ...params,
          updatedAt: new Date(),
        })
        .where(eq(siteSettings.id, DEFAULT_SETTINGS_ID));
    } else {
      await db.insert(siteSettings).values({
        id: DEFAULT_SETTINGS_ID,
        ...params,
      });
    }

    revalidatePath("/");
    revalidatePath("/contact");
    revalidatePath("/about");
    revalidatePath("/admin/settings");
    await invalidateCache(["site-settings"]);

    return { success: true };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to update settings.";
    return { success: false, error: message };
  }
}
